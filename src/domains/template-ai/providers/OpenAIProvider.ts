import { TemplateAIProvider } from './TemplateAIProvider';
import { VisualIntent } from '../services/IntentParser';
import { Template, TemplateVariation, TemplateSchema } from '@/src/schemas';
import { TemplateGenerator } from '../services/TemplateGenerator';
import { TemplateQualityScorer } from '../services/TemplateQualityScorer';
import { TemplateAINormalizer } from '../services/TemplateAINormalizer';

export class OpenAIProvider implements TemplateAIProvider {
    name = 'openai';

    private apiKey: string;
    private model: string;

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    }

    async generateIntent(prompt: string): Promise<VisualIntent> {
        if (!this.apiKey) throw new Error('OpenAI API Key missing');

        const system = `You are a professional Art Director for lyric videos.
Interpret the user prompt into a structured Visual Intent.
Available fonts: [Inter, Roboto, Playfair Display, Montserrat, Bebas Neue].
Available palettes: [neon, cinematic, minimal, organic, luxury].
Output JSON matching the VisualIntent schema.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        // Normalize AI guesswork to project constraints
        return TemplateAINormalizer.normalizeIntent(content);
    }

    async generateVariants(prompt: string): Promise<TemplateVariation[]> {
        const intent = await this.generateIntent(prompt);
        // Use local generator to ensure templates are VALID, based on AI intent
        const variants = TemplateGenerator.generateVariants(intent, prompt);

        return variants.map(v => {
            const score = TemplateQualityScorer.score(v.template);
            return {
                ...v,
                score: score.score,
                explanation: `[OpenAI ${this.model}] ${v.explanation}`
            };
        });
    }

    async refineTemplate(template: Template, prompt: string): Promise<Template> {
        // AI refinement logic... return refined template
        return template; // Mocked for now, will implement normalizer-based refinement
    }
}
