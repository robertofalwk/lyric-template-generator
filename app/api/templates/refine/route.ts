import { NextRequest, NextResponse } from 'next/server';
import { TemplateRefiner } from '@/src/domains/template-ai/services/TemplateRefiner';
import { TemplateSchema } from '@/src/schemas';

export async function POST(req: NextRequest) {
    try {
        const { currentTemplate, prompt } = await req.json();
        if (!currentTemplate || !prompt) return NextResponse.json({ error: 'Missing template or prompt' }, { status: 400 });

        const validated = TemplateSchema.parse(currentTemplate);
        const refined = TemplateRefiner.refine(validated, prompt);

        return NextResponse.json(refined);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
