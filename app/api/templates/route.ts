import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';
import { TemplateService } from '@/src/domains/templates/TemplateService';
import { TemplateSchema } from '@/src/schemas';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sourceFilter = searchParams.get('source');
        const onlyFavorite = searchParams.get('favorite') === 'true';
        const templates = await TemplateService.listAllMerged();

        const filtered = templates.filter((template) => {
            if (sourceFilter && template.metadata?.sourceType !== sourceFilter) return false;
            if (onlyFavorite && !template.metadata?.isFavorite) return false;
            return true;
        });

        // Keep stable ordering and avoid accidental dupes by ID.
        const deduped = Array.from(
            new Map(filtered.map((template) => [template.id, template])).values()
        );
        return NextResponse.json(deduped);
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
