import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import db from '@/src/server/database/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const stats = {
            audioOk: !!project.audioOriginalPath,
            timelineOk: !!project.timeline,
            scenesOk: false,
            templateOk: !!project.selectedTemplateId,
            repaired: [] as string[]
        };

        const scenes = await projectSceneRepository.findByProjectId(id);
        stats.scenesOk = scenes.length > 0;

        // Repair 1: If timeline exists but no scenes, try to direct
        if (stats.timelineOk && !stats.scenesOk) {
            try {
                const { VisualDirectorService } = await import('@/src/domains/template-ai/services/VisualDirectorService');
                const newScenes = await VisualDirectorService.direct(project, project.timeline!);
                if (newScenes.length > 0) {
                    for (const s of newScenes) {
                        await projectSceneRepository.save(s);
                    }
                    stats.scenesOk = true;
                    stats.repaired.push('Scenes auto-generated.');
                }
            } catch (e: any) {
                console.error('Repair failed to generate scenes: ', e.message);
            }
        }

        // Repair 2: Status mismatches
        let newStatus = project.status;
        let newAlignmentStatus = project.alignmentStatus;

        if (project.alignmentStatus === 'processing' && !stats.timelineOk) {
            // Assume stalled
            db.prepare('DELETE FROM render_jobs WHERE projectId = ? AND type = ? AND status IN (?, ?)').run(id, 'alignment', 'queued', 'processing');
            newAlignmentStatus = 'none';
            newStatus = 'draft';
            stats.repaired.push('Stalled alignment jobs cleared.');
        } else if (project.alignmentStatus === 'processing' && stats.timelineOk) {
            newAlignmentStatus = 'completed';
            newStatus = 'ready';
            stats.repaired.push('Alignment status synced with existence of timeline.');
        }

        if (project.renderStatus === 'processing') {
            // Assume stalled
            db.prepare('DELETE FROM render_jobs WHERE projectId = ? AND type = ? AND status IN (?, ?)').run(id, 'render', 'queued', 'processing');
            const updatedProject = { ...project, renderStatus: 'none' as const, alignmentStatus: newAlignmentStatus as any, status: newStatus as any };
            await projectRepository.save(updatedProject);
            stats.repaired.push('Stalled render jobs cleared.');
        } else if (newAlignmentStatus !== project.alignmentStatus || newStatus !== project.status) {
            const updatedProject = { ...project, alignmentStatus: newAlignmentStatus as any, status: newStatus as any };
            await projectRepository.save(updatedProject);
        }

        return NextResponse.json({ success: true, stats });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
