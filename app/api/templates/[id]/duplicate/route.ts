import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const duplicated = await templateRepository.duplicate(id);
        return NextResponse.json(duplicated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
