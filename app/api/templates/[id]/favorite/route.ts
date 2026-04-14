import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';
import { TemplateService } from '@/src/domains/templates/TemplateService';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { isFavorite } = await req.json();

        const persisted = await templateRepository.findById(id);
        if (persisted) {
            await templateRepository.setFavorite(id, isFavorite);
        } else {
            const resolved = await TemplateService.resolve(id);
            await templateRepository.save({
                ...resolved,
                metadata: {
                    ...resolved.metadata,
                    isFavorite: Boolean(isFavorite),
                },
            });
        }

        return NextResponse.json({ success: true, isFavorite });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
