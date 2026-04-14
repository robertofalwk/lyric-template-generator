import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();
        if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

        const provider = TemplateAIProviderFactory.getProvider();
        console.log(`[TemplateAI] Using provider: ${provider.name}`);

        try {
            const variants = await provider.generateVariants(prompt);
            return NextResponse.json(variants);
        } catch (providerError: any) {
            console.error(`[TemplateAI] Provider ${provider.name} failed:`, providerError);
            
            // Only fallback if we are already in local mode, or if we want to explicitly allow it but with a header.
            // But to "remove silent fallback", we should probably error out if it was supposed to be OpenAI.
            if (provider.name === 'local-heuristics') {
                throw providerError; // Should not happen if it's local heuristics, but for safety
            }

            // Return the error so UI can show it
            return NextResponse.json({ 
                error: `Provider ${provider.name} failed: ${providerError.message}`,
                provider: provider.name
            }, { status: 502 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
