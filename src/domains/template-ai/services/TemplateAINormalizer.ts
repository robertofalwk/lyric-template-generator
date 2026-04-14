import { VisualIntent } from './IntentParser';
import { Template } from '@/src/schemas';

export class TemplateAINormalizer {
    private static ALLOWED_FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Bebas Neue'];
    private static ALLOWED_PALETTES = ['neon', 'cinematic', 'minimal', 'organic', 'luxury'];
    private static ALLOWED_MODES = ['color', 'image', 'blur', 'video', 'transparent'];

    static normalizeIntent(aiResponse: any): VisualIntent {
        let font = aiResponse.font || aiResponse.fontFamily || 'Inter';
        if (!this.ALLOWED_FONTS.includes(font)) font = 'Inter';

        let palette = aiResponse.palette || 'minimal';
        if (!this.ALLOWED_PALETTES.includes(palette)) palette = 'minimal';

        let mode = aiResponse.backgroundMode || 'color';
        if (!this.ALLOWED_MODES.includes(mode)) mode = 'color';

        return {
            mood: aiResponse.mood || 'clean',
            font,
            palette: palette as any,
            backgroundMode: mode === 'blur' || mode === 'transparent' ? mode : 'color',
            isNeon: palette.includes('neon') || palette.includes('cyber'),
            emphasis: aiResponse.emphasis || 'word',
            intensity: aiResponse.intensity || 'medium',
            platform: aiResponse.platform || 'reels',
            isComposite: Boolean(aiResponse.isComposite)
        };
    }

    /**
     * V6 Specialized Refinement Normalizer
     * Ensures AI delta-suggestions match system constraints
     */
    static normalizeRefinement(delta: Partial<Template>): Partial<Template> {
        const normalized: Partial<Template> = { ...delta };

        // Font Safety
        if (normalized.fontFamily && !this.ALLOWED_FONTS.includes(normalized.fontFamily)) {
            delete normalized.fontFamily; // Discard invalid font suggestions
        }

        // Mode Safety
        if (normalized.backgroundMode && !this.ALLOWED_MODES.includes(normalized.backgroundMode)) {
            delete normalized.backgroundMode;
        }

        // Color Safety (hex check)
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (normalized.textColor && !hexRegex.test(normalized.textColor)) delete normalized.textColor;
        if (normalized.backgroundColor && !hexRegex.test(normalized.backgroundColor)) delete normalized.backgroundColor;

        // Range Safety
        if (normalized.fontSize) normalized.fontSize = Math.min(Math.max(normalized.fontSize, 12), 200);
        if (normalized.backgroundOverlayOpacity) {
            normalized.backgroundOverlayOpacity = Math.min(Math.max(normalized.backgroundOverlayOpacity, 0), 1);
        }

        return normalized;
    }
}
