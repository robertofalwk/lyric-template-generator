import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

export async function POST(req: NextRequest) {
    try {
        const { currentTemplate, prompt } = await req.json();
        if (!currentTemplate || !prompt) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

        const provider = TemplateAIProviderFactory.getProvider();
        
        try {
            const refined = await provider.refineTemplate(currentTemplate, prompt);
            return NextResponse.json(refined);
        } catch (error) {
            console.error(`[TemplateAI] Refinement failed on ${provider.name}, falling back to local:`, error);
            
            const { LocalHeuristicProvider } = await import('@/src/domains/template-ai/providers/LocalHeuristicProvider');
            const fallback = new LocalHeuristicProvider();
            const refined = await fallback.refineTemplate(currentTemplate, prompt);
            
            return NextResponse.json(refined, { 
                headers: { 'X-TemplateAI-Fallback': 'true' } 
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
