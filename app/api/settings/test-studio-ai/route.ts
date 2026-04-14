import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

export async function POST() {
    try {
        const provider = TemplateAIProviderFactory.getProvider();
        
        // Use generateIntent which is a pure signal test, NOT refineTemplate (which validates full Template schema)
        // This avoids "expected string at id" errors during a simple connection test.
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
