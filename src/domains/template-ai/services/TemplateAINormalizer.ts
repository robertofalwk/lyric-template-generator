import { VisualIntent } from './IntentParser';

export class TemplateAINormalizer {
    private static ALLOWED_FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Bebas Neue'];
    private static ALLOWED_PALETTES = ['neon', 'cinematic', 'minimal', 'organic', 'luxury'];
    private static ALLOWED_MODES = ['color', 'image', 'blur', 'video', 'transparent'];

    static normalizeIntent(aiResponse: any): VisualIntent {
        // 1. Font Normalization
        let font = aiResponse.fontFamily || 'Inter';
        if (!this.ALLOWED_FONTS.includes(font)) {
            // Find closest or default
            font = 'Inter';
        }

        // 2. Palette Normalization
        let palette = aiResponse.palette || 'minimal';
        if (!this.ALLOWED_PALETTES.includes(palette)) {
            palette = 'minimal';
        }

        // 3. Mode Normalization
        let mode = aiResponse.backgroundMode || 'color';
        if (!this.ALLOWED_MODES.includes(mode)) {
            mode = 'color';
        }

        return {
            mood: aiResponse.mood || 'neutral',
            fontFamily: font as any,
            palette: palette as any,
            backgroundMode: mode as any,
            emphasis: aiResponse.emphasis || 'word',
            intensity: aiResponse.intensity || 'medium',
            platform: aiResponse.platform || 'reels',
            summary: aiResponse.summary || 'AI Optimized Design'
        };
    }
}
 Isra
