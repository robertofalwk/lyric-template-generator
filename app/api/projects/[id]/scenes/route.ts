import { NextRequest, NextResponse } from 'next/server';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import { SceneDetectionService } from '@/src/domains/templates/SceneDetectionService';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const scenes = await projectSceneRepository.findByProjectId(params.id);
        return NextResponse.json(scenes);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const project = await projectRepository.findById(params.id);
        if (!project || !project.timeline) throw new Error('Project or timeline not found');

        const detected = SceneDetectionService.detect(params.id, project.timeline);
        for (const s of detected) {
            await projectSceneRepository.save(s);
        }

        return NextResponse.json(detected);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
 Isra
