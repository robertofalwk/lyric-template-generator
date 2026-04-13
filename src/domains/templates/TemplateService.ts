import { Template, TemplateSchema } from '@/src/schemas';
import { TEMPLATES_REGISTRY } from './registry';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export class TemplateService {
    /**
     * Resolves a template by ID, checking the persistent DB first, then the stock registry.
     * Guaranteed to return a valid Template or throw if everything fails.
     */
    static async resolve(id: string): Promise<Template> {
        if (!id) return TemplateSchema.parse(TEMPLATES_REGISTRY[0]);

        // 1. Try DB first (Custom/Generative/User saved)
        try {
            const saved = await templateRepository.findById(id);
            if (saved) return saved;
        } catch (err) {
            console.error(`[TemplateService] DB resolution error for ${id}:`, err);
        }

        // 2. Try Stock Registry
        const stock = TEMPLATES_REGISTRY.find(t => t.id === id);
        if (stock) {
            return TemplateSchema.parse(stock);
        }

        // 3. Fallback
        console.warn(`[TemplateService] Template ${id} not found, falling back to registry default.`);
        return TemplateSchema.parse(TEMPLATES_REGISTRY[0]);
    }

    /**
     * Lists all available templates, merging registry and db.
     */
    static async listAllMerged(): Promise<Template[]> {
        const custom = await templateRepository.findAll();
        const registry = TEMPLATES_REGISTRY.map(t => TemplateSchema.parse(t));
        
        // Use a map to ensure IDs don't overlap (though they shouldn't)
        const all = new Map<string, Template>();
        registry.forEach(t => all.set(t.id, t));
        custom.forEach(t => all.set(t.id, t));

        return Array.from(all.values());
    }

    /**
     * Lists only stock templates.
     */
    static listStock(): Template[] {
        return TEMPLATES_REGISTRY.map(t => TemplateSchema.parse(t));
    }

    /**
     * Lists only custom/saved templates.
     */
    static async listCustom(): Promise<Template[]> {
        return templateRepository.findAll();
    }

    /**
     * Checks if a template exists anywhere.
     */
    static async exists(id: string): Promise<boolean> {
        if (TEMPLATES_REGISTRY.some(t => t.id === id)) return true;
        const saved = await templateRepository.findById(id);
        return !!saved;
    }
}
