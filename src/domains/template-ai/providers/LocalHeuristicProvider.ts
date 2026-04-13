import { TemplateAIProvider } from './TemplateAIProvider';
import { IntentParser, VisualIntent } from '../services/IntentParser';
import { TemplateGenerator } from '../services/TemplateGenerator';
import { TemplateRefiner } from '../services/TemplateRefiner';
import { Template, TemplateVariation } from '@/src/schemas';
import { TemplateQualityScorer } from '../services/TemplateQualityScorer';

export class LocalHeuristicProvider implements TemplateAIProvider {
    name = 'local-heuristics';

    async generateIntent(prompt: string): Promise<VisualIntent> {
        return IntentParser.parse(prompt);
    }

    async generateVariants(prompt: string): Promise<TemplateVariation[]> {
        const intent = await this.generateIntent(prompt);
        const variants = TemplateGenerator.generateVariants(intent, prompt);
        
        return variants.map(v => {
            const score = TemplateQualityScorer.score(v.template);
            return {
                ...v,
                score: score.score,
                explanation: `[Local Neural] ${v.explanation || intent.mood}`
            };
        });
    }

    async refineTemplate(template: Template, prompt: string): Promise<Template> {
        const refined = await TemplateRefiner.refine(template, prompt);
        
        // Apply V6 Operational Metadata
        const metaAware = {
            ...refined,
            metadata: {
                ...refined.metadata,
                sourceType: 'ai-refined',
                aiMode: 'local-fallback',
                providerUsed: this.name,
                aiRefinedAt: new Date().toISOString()
            }
        } as Template;

        const score = TemplateQualityScorer.score(metaAware);
        metaAware.metadata.qualityScore = score.score;

        return metaAware;
    }
}
