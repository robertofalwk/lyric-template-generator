import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';
import { TemplateService } from '@/src/domains/templates/TemplateService';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const template = await TemplateService.resolve(id);
        if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const fromDb = await templateRepository.findById(id);
        if (!fromDb) {
            return NextResponse.json(
                { error: 'Stock templates cannot be deleted directly' },
                { status: 400 }
            );
        }
        await templateRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
