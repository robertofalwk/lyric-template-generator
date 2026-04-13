import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

export async function POST(req: NextRequest) {
    try {
        const { currentTemplate, prompt } = await req.json();
        if (!currentTemplate || !prompt) return NextResponse.json({ error: 'Missing refinement data' }, { status: 400 });

        const provider = TemplateAIProviderFactory.getProvider();
        console.log(`[TemplateAI:Refine] Initiating refinement via ${provider.name}`);

        try {
            const refined = await provider.refineTemplate(currentTemplate, prompt);
            return NextResponse.json(refined);
        } catch (error: any) {
            console.warn(`[TemplateAI:Refine] ${provider.name} failed. Activating Hard Fallback. Reason: ${error.message}`);
            
            // Explicit Fallback to Heuristics
            const { LocalHeuristicProvider } = await import('@/src/domains/template-ai/providers/LocalHeuristicProvider');
            const fallback = new LocalHeuristicProvider();
            
            const refined = await fallback.refineTemplate(currentTemplate, prompt);
            
            return NextResponse.json(refined, { 
                headers: { 
                    'X-TemplateAI-Fallback': 'true',
                    'X-TemplateAI-Provider': provider.name,
                    'X-TemplateAI-Error': error.message 
                } 
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
