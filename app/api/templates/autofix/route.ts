import { NextRequest, NextResponse } from 'next/server';
import { TemplateAutoFixService } from '@/src/domains/template-ai/services/TemplateAutoFixService';
import { TemplateQualityScorer } from '@/src/domains/template-ai/services/TemplateQualityScorer';

export async function POST(req: NextRequest) {
    try {
        const { currentTemplate, mode } = await req.json();
        if (!currentTemplate) return NextResponse.json({ error: 'currentTemplate is required' }, { status: 400 });

        const fixed = TemplateAutoFixService.apply(currentTemplate, mode);
        const score = TemplateQualityScorer.score(fixed);
        
        fixed.metadata = { 
            ...fixed.metadata, 
            qualityScore: score.score,
            sourceType: 'ai-refined' 
        };

        return NextResponse.json(fixed);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
