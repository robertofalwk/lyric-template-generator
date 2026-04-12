import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { ExportJob } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { GlobalWorker } from '@/lib/worker';

// Start worker in background
GlobalWorker.start();

export async function POST(req: NextRequest) {
    try {
        const { projectId, formats } = await req.json();
        
        const project = await Storage.getProject(projectId);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const jobId = uuidv4();
        const job: ExportJob = {
            id: jobId,
            projectId,
            status: 'queued',
            progress: 0,
            formats: formats || ['mp4'],
            createdAt: new Date().toISOString()
        };

        await Storage.saveJob(job);

        return NextResponse.json(job);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create export job' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('id');

    if (jobId) {
        const jobs = await Storage.getJobs();
        const job = jobs.find(j => j.id === jobId);
        return NextResponse.json(job || { error: 'Job not found' });
    }

    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 });
}
