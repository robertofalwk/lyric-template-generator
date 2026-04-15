import { NextRequest, NextResponse } from 'next/server';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import { SceneDetectionService } from '@/src/domains/templates/SceneDetectionService';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const scenes = await projectSceneRepository.findByProjectId(id);
        return NextResponse.json(scenes);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const project = await projectRepository.findById(id);
        if (!project || !project.timeline) throw new Error('Project or timeline not found');

        const detected = SceneDetectionService.detect(id, project.timeline);
        for (const s of detected) {
            await projectSceneRepository.save(s);
        }

        return NextResponse.json(detected);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const newScenes = await req.json();
        
        await projectSceneRepository.deleteByProjectId(id);
        for (const s of newScenes) {
            await projectSceneRepository.save(s);
        }
        
        return NextResponse.json(newScenes);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

