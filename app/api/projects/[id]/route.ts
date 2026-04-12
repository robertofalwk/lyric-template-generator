import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const project = await projectRepository.findById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json(project);
}
