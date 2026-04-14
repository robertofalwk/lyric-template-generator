import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

import { OpenAIProvider } from '@/src/domains/template-ai/providers/OpenAIProvider';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        let provider;
        
        if (body.ai_provider === 'openai' && body.openai_api_key) {
            provider = new OpenAIProvider({ 
                apiKey: body.openai_api_key, 
                model: body.openai_model 
            });
        } else {
            provider = TemplateAIProviderFactory.getProvider();
        }
        
        // Use generateIntent which is a pure signal test
        const signal = await provider.generateIntent('Studio Connection Test. Ping.');

        return NextResponse.json({ 
            success: true, 
            provider: provider.name,
            intelligenceModel: (provider as any).model || 'default',
            status: 'Operational',
            signalDetected: !!signal
        });
    } catch (error: any) {
        console.error('[STUDIO_AI_TEST_FAILURE]', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
