import { NextRequest, NextResponse } from 'next/server';
import { jobRepository } from '@/src/server/repositories/JobRepository';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const job = await jobRepository.findById(id);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json(job);
}
