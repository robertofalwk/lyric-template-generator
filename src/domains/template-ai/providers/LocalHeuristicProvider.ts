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
                explanation: v.explanation || `Local interpretation of: ${intent.mood}`
            };
        });
    }

    async refineTemplate(template: Template, prompt: string): Promise<Template> {
        return TemplateRefiner.refine(template, prompt);
    }
}
