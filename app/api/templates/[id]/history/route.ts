import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const history = await templateRepository.getHistory(id);
        return NextResponse.json(history);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
