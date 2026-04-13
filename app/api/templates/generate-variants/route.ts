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
        } catch (providerError) {
            console.error(`[TemplateAI] Provider ${provider.name} failed, falling back to local:`, providerError);
            
            // Explicit fallback to local if external fails
            const { LocalHeuristicProvider } = await import('@/src/domains/template-ai/providers/LocalHeuristicProvider');
            const fallback = new LocalHeuristicProvider();
            const variants = await fallback.generateVariants(prompt);
            
            return NextResponse.json(variants, { 
                headers: { 'X-TemplateAI-Fallback': 'true' } 
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
