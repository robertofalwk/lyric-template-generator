import { VisualIntent } from '../services/IntentParser';
import { Template, TemplateVariation } from '@/src/schemas';

export interface TemplateAIProvider {
    name: string;
    generateIntent(prompt: string): Promise<VisualIntent>;
    generateVariants(prompt: string): Promise<TemplateVariation[]>;
    refineTemplate(template: Template, prompt: string): Promise<Template>;
}
