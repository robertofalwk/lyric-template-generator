import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const body = await req.json();
        // @ts-ignore
        const updated = { ...project, ...body, updatedAt: new Date().toISOString() };
        await projectRepository.save(updated);
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
