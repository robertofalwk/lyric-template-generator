import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { newName } = await req.json();

        const duplicated = await templateRepository.duplicate(id, newName);
        return NextResponse.json(duplicated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
