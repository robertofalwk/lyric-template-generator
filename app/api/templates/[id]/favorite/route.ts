import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { isFavorite } = await req.json();
        await templateRepository.setFavorite(id, isFavorite);
        return NextResponse.json({ success: true, isFavorite });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
