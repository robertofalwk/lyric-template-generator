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
    private timeoutMs: number;

    constructor(config?: { apiKey?: string; model?: string; timeoutMs?: number }) {
        this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || '';
        this.model = config?.model || process.env.OPENAI_MODEL || 'gpt-4o';
        this.timeoutMs = config?.timeoutMs || parseInt(process.env.TEMPLATE_AI_TIMEOUT_MS || '20000');
    }

    async generateIntent(prompt: string): Promise<VisualIntent> {
        return this.callOpenAI<VisualIntent>(
            `You are a professional Art Director for lyric videos.
            Interpret the user prompt into a structured Visual Intent.
            Available fonts: [Inter, Roboto, Playfair Display, Montserrat, Bebas Neue].
            Available palettes: [neon, cinematic, minimal, organic, luxury].
            Output JSON matching the VisualIntent schema exactly.`,
            prompt
        ).then(res => TemplateAINormalizer.normalizeIntent(res));
    }

    async generateVariants(prompt: string): Promise<TemplateVariation[]> {
        const intent = await this.generateIntent(prompt);
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
        const system = `You are a professional Art Director.
        Refine the provided lyric video template based on the user's request.
        Current Template JSON: ${JSON.stringify(template)}
        
        Guidelines:
        1. Only suggest modifications to EXISTING fields.
        2. Do not invent new fields.
        3. Match available fonts: [Inter, Roboto, Playfair Display, Montserrat, Bebas Neue].
        4. Match available background modes: [color, image, blur, video, transparent].
        5. Return ONLY a JSON object containing the delta fields to be updated.`;

        const delta = await this.callOpenAI<Partial<Template>>(system, prompt);
        
        // 1. Normalize the AI's suggestions
        const normalizedDelta = TemplateAINormalizer.normalizeRefinement(delta);

        // 2. Deep merge with safety
        const refined = { 
            ...template, 
            ...normalizedDelta,
            metadata: {
                ...template.metadata,
                sourceType: 'ai-refined',
                aiMode: 'external',
                providerUsed: 'openai',
                modelUsed: this.model,
                aiRefinedAt: new Date().toISOString()
            }
        } as Template;

        // 3. Final Guardrails (Schema & Score)
        const validated = TemplateSchema.parse(refined);
        const score = TemplateQualityScorer.score(validated);
        validated.metadata.qualityScore = score.score;

        return validated;
    }

    private async callOpenAI<T>(system: string, user: string): Promise<T> {
        if (!this.apiKey) throw new Error('OpenAI API Key missing');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: user }
                    ],
                    response_format: { type: 'json_object' }
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(`OpenAI Error (${response.status}): ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (!data.choices?.[0]?.message?.content) {
                throw new Error('OpenAI returned invalid choice structure');
            }

            return JSON.parse(data.choices[0].message.content) as T;
        } finally {
            clearTimeout(timeout);
        }
    }
}
