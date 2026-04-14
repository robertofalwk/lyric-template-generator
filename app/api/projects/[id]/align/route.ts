import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { jobRepository } from '@/src/server/repositories/JobRepository';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        if (!project.audioOriginalPath) {
            return NextResponse.json({ error: 'Audio file not uploaded yet' }, { status: 400 });
        }

        // Create alignment job
        const jobId = uuidv4();
        const job = {
            id: jobId,
            projectId: id,
            type: 'alignment' as const,
            status: 'queued' as const,
            progress: 0,
            createdAt: new Date().toISOString(),
            logs: ['Alignment job created']
        };

        await jobRepository.save(job);
        
        // Update project status
        await projectRepository.save({ 
            ...project, 
            alignmentStatus: 'processing',
            status: 'processing'
        });

        return NextResponse.json(job);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
