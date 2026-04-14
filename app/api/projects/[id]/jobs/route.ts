import { NextRequest, NextResponse } from 'next/server';
import { jobRepository } from '@/src/server/repositories/JobRepository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const jobs = await jobRepository.getByProjectId(id);
        return NextResponse.json(jobs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
