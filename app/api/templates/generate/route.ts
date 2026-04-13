import { NextRequest, NextResponse } from 'next/server';
import { IntentParser } from '@/src/domains/template-ai/services/IntentParser';
import { TemplateGenerator } from '@/src/domains/template-ai/services/TemplateGenerator';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

        const intent = IntentParser.parse(prompt);
        const template = TemplateGenerator.generate(intent, prompt);

        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
