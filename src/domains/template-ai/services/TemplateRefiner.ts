import { Template, TemplateSchema } from '@/src/schemas';

export class TemplateRefiner {
    static refine(current: Template, instruction: string): Template {
        const text = instruction.toLowerCase();
        let updated = { ...current };

        // Position refinements
        if (text.includes('baixo') || text.includes('down')) updated.position.y = Math.min(updated.position.y + 10, 90);
        if (text.includes('cima') || text.includes('up')) updated.position.y = Math.max(updated.position.y - 10, 10);
        if (text.includes('esquerda')) updated.alignment = 'left';
        if (text.includes('direita')) updated.alignment = 'right';
        if (text.includes('centro')) updated.alignment = 'center';

        // Size refinements
        if (text.includes('maior') || text.includes('grande')) updated.fontSize += 10;
        if (text.includes('menor') || text.includes('pequeno')) updated.fontSize -= 10;

        // Visual refinements
        if (text.includes('mais brilho') || text.includes('glow')) {
            updated.glow = true;
            updated.glowRadius = (updated.glowRadius || 0) + 10;
        }
        if (text.includes('menos brilho')) updated.glow = false;
        
        if (text.includes('uppercase') || text.includes('maiúscula')) updated.textTransform = 'uppercase';
        if (text.includes('lowercase')) updated.textTransform = 'lowercase';

        // Background
        if (text.includes('escurecer')) {
            updated.backgroundOverlayOpacity = Math.min(updated.backgroundOverlayOpacity + 0.2, 1);
            updated.backgroundOverlayColor = '#000000';
        }

        // Metadata update
        updated.metadata = {
            ...updated.metadata,
            sourceType: 'ai-refined',
            version: (updated.metadata?.version || 1) + 1
        };

        return TemplateSchema.parse(updated);
    }
}
