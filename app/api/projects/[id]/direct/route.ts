import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import { VisualDirectorService } from '@/src/domains/template-ai/services/VisualDirectorService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project || !project.timeline) {
            return NextResponse.json({ error: 'Project or timeline not found' }, { status: 404 });
        }

        // 1. Generate Smart Scenes
        const scenes = await VisualDirectorService.direct(project, project.timeline);

        // 2. Clear old scenes and save new ones
        await projectSceneRepository.deleteByProjectId(id);
        for (const scene of scenes) {
            await projectSceneRepository.save(scene);
        }

        // 3. Update Project Status to ready for review
        await projectRepository.updateStatus(id, 'ready');

        return NextResponse.json({ success: true, sceneCount: scenes.length });
    } catch (error: any) {
        console.error('[VisualDirector API Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
