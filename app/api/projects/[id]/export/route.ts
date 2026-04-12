import { NextRequest, NextResponse } from 'next/server';
import { jobManager } from '@/src/domains/jobs/JobManager';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        
        const job = await jobManager.createJob(id, body.formats || ['mp4']);
        
        return NextResponse.json(job);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
