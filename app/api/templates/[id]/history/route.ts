import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const history = await templateRepository.getHistory(id);
        return NextResponse.json(history);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
