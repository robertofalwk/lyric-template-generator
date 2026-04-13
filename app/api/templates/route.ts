import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';
import { TemplateSchema } from '@/src/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filter = {
            sourceType: searchParams.get('source') || undefined,
            isFavorite: searchParams.get('favorite') === 'true'
        };
        const templates = await templateRepository.findAll(filter);
        return NextResponse.json(templates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const validated = TemplateSchema.parse(body);
        await templateRepository.save(validated);
        return NextResponse.json(validated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
