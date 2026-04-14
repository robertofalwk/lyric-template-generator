import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';
import { TemplateService } from '@/src/domains/templates/TemplateService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const persisted = await templateRepository.findById(id);
        let duplicated;

        if (persisted) {
            duplicated = await templateRepository.duplicate(id);
        } else {
            const source = await TemplateService.resolve(id);
            duplicated = {
                ...source,
                id: `tpl_${uuidv4().slice(0, 8)}`,
                name: `${source.name} (Copy)`,
                metadata: {
                    ...source.metadata,
                    sourceType: 'manual' as const,
                    baseTemplateId: source.id,
                    isFavorite: false,
                    version: 1,
                },
            };
            await templateRepository.save(duplicated, {
                createVersion: true,
                prompt: `Duplicated from stock template ${source.name}`,
            });
        }

        return NextResponse.json(duplicated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
