import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { alignmentService } from '@/src/domains/alignment/AlignmentService';
import path from 'path';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        if (!project.audioOriginalPath) {
            return NextResponse.json({ error: 'Audio file not uploaded yet' }, { status: 400 });
        }

        await projectRepository.save({ ...project, alignmentStatus: 'processing' });

        const timelinePath = path.join(process.cwd(), 'storage', 'projects', id, 'timeline.json');
        
        try {
            const timeline = await alignmentService.align(
                project.audioOriginalPath,
                project.lyricsRaw,
                project.settings,
                timelinePath
            );

            const updatedProject = {
                ...project,
                alignmentStatus: 'completed' as const,
                latestTimelinePath: timelinePath,
                status: 'ready' as const,
                updatedAt: new Date().toISOString()
            };

            await projectRepository.save(updatedProject);
            return NextResponse.json({ project: updatedProject, timeline });
        } catch (err: any) {
            await projectRepository.save({ ...project, alignmentStatus: 'failed' });
            throw err;
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
