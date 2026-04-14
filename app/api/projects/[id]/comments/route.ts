import { NextRequest, NextResponse } from 'next/server';
import { projectCommentRepository } from '@/src/server/repositories/ProjectCommentRepository';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const comments = await projectCommentRepository.findByProjectId(id);
        return NextResponse.json(comments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const comment = await projectCommentRepository.save({ ...body, projectId: id });
        return NextResponse.json(comment);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
