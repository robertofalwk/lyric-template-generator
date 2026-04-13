import { Template, TemplateSchema } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from './registry';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export class TemplateService {
    /**
     * Resolves a template by ID, checking the persistent DB first, then the stock registry.
     */
    static async resolve(id: string): Promise<Template> {
        // Try DB first (Custom or Generative)
        const saved = await templateRepository.findById(id);
        if (saved) return saved;

        // Try Stock Registry
        const stock = TEMPLATES_REGISTRY.find(t => t.id === id);
        if (stock) return TemplateSchema.parse(stock);

        console.warn(`[TemplateService] Template ${id} not found, falling back to default.`);
        return TemplateSchema.parse(TEMPLATES_REGISTRY[0]);
    }

    static async getAll(): Promise<Template[]> {
        const saved = await templateRepository.findAll();
        return [...TEMPLATES_REGISTRY, ...saved];
    }
}
