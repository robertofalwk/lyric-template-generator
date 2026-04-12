import { Template, TemplateSchema } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from './registry';

export class TemplateService {
    static resolve(id: string): Template {
        const template = TEMPLATES_REGISTRY.find(t => t.id === id);
        if (!template) {
            console.warn(`[TemplateService] Template ${id} not found, falling back to default.`);
            return TEMPLATES_REGISTRY[0];
        }
        return TemplateSchema.parse(template);
    }

    static getAll(): Template[] {
        return TEMPLATES_REGISTRY;
    }
}
