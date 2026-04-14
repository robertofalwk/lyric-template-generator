import { Template, TemplateSchema, TemplateVariation } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';
import { VisualIntent } from './IntentParser';
import { COLOR_PALETTES, STYLE_PRESETS } from '../catalog';
import { TemplateQualityScorer } from './TemplateQualityScorer';

export class TemplateGenerator {
    static generateVariants(intent: VisualIntent, prompt: string): TemplateVariation[] {
        return [
            this.createVariant('safe', intent, prompt),
            this.createVariant('balanced', intent, prompt),
            this.createVariant('bold', intent, prompt)
        ];
    }

    private static createVariant(type: 'safe' | 'balanced' | 'bold', intent: VisualIntent, prompt: string): TemplateVariation {
        const palette = COLOR_PALETTES[intent.palette];
        const style = STYLE_PRESETS[intent.mood];
        const id = uuidv4();

        // Safe variant is more readable, smaller fonts, no excessive glow
        // Bold variant is more aggressive, larger fonts, high intensity effects
        const mod = {
            fontSize: type === 'safe' ? 52 : type === 'bold' ? 88 : 72,
            glow: type === 'safe' ? false : intent.isNeon,
            glowRadius: type === 'bold' ? 40 : 20,
            animationIn: type === 'safe' ? 'fade' : style.animationIn,
            maxTextWidth: type === 'safe' ? 70 : 90
        };

        const template = {
            id,
            name: `${this.capitalize(intent.mood)} - ${this.capitalize(type)}`,
            category: 'AI Variations',
            ratio: '9:16' as const,
            
            // Typography
            fontFamily: intent.font,
            fontSize: mod.fontSize,
            fontWeight: style.fontWeight,
            lineHeight: 1.2,
            letterSpacing: intent.mood === 'elegant' ? 2 : 0,
            textTransform: style.textTransform,
            textColor: palette.text,
            activeWordColor: palette.active,
            
            // Effects
            strokeColor: 'transparent',
            strokeWidth: 0,
            shadow: type === 'bold' || intent.mood === 'impactful',
            shadowColor: 'rgba(0,0,0,0.5)',
            glow: mod.glow,
            glowColor: palette.active,
            glowRadius: mod.glowRadius,
            blur: false,
            
            // Layout
            alignment: 'center' as const,
            position: { x: 50, y: 50 },
            maxTextWidth: mod.maxTextWidth,
            safeArea: true,
            
            // Animation
            animationIn: mod.animationIn,
            animationOut: 'none' as const,
            highlightMode: intent.emphasis,
            wordScaleActive: style.wordScaleActive,
            
            // Background
            backgroundMode: intent.backgroundMode,
            backgroundColor: palette.background,
            backgroundBlur: intent.backgroundMode === 'blur' ? 20 : 0,
            backgroundOverlayColor: '#000000',
            backgroundOverlayOpacity: intent.backgroundMode === 'blur' ? 0.3 : 0,
            
            // Metadata
            metadata: {
                sourceType: 'ai-generated' as const,
                originalPrompt: prompt,
                version: 1,
                tags: [intent.mood, intent.palette, type],
                qualityScore: 0 // Will score later
            }
        };

        const validated = TemplateSchema.parse(template);
        const quality = TemplateQualityScorer.score(validated);
        validated.metadata!.qualityScore = quality.score;

        return {
            id,
            type,
            template: validated,
            score: quality.score,
            explanation: quality.recommendations[0] || quality.warnings[0]
        };
    }

    private static capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
