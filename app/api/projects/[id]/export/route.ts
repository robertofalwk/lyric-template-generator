import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { jobRepository } from '@/src/server/repositories/JobRepository';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const body = await req.json();
        const jobId = uuidv4();
        
        const job = {
            id: jobId,
            projectId: id,
            type: 'render' as const,
            status: 'queued' as const,
            progress: 0,
            createdAt: new Date().toISOString(),
            logs: ['Render job queued']
        };

        await jobRepository.save(job);
        
        return NextResponse.json(job);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
