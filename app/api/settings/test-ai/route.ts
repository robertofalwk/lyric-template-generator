import { NextRequest, NextResponse } from 'next/server';
import { TemplateAIProviderFactory } from '@/src/domains/template-ai/providers/TemplateAIProviderFactory';

export async function POST() {
    try {
        const provider = TemplateAIProviderFactory.getProvider();
        
        // Simple test: Ask for a tiny refinement
        const result = await provider.refineTemplate({
            name: 'Health Test',
            fontFamily: 'Inter',
            fontSize: 12,
            textColor: '#000000',
            activeWordColor: '#FF0000',
            ratio: '9:16',
        } as any, 'This is a test. Reply with OK.');

        return NextResponse.json({ 
            success: true, 
            provider: provider.constructor.name,
            result: typeof result === 'string' ? 'Success' : 'Format OK'
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
