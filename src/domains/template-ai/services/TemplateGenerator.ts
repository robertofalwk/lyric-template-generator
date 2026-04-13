import { Template, TemplateSchema } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';
import { VisualIntent } from './IntentParser';
import { COLOR_PALETTES, STYLE_PRESETS } from '../catalog';

export class TemplateGenerator {
    static generate(intent: VisualIntent, prompt: string): Template {
        const palette = COLOR_PALETTES[intent.palette];
        const style = STYLE_PRESETS[intent.mood];

        const template = {
            id: uuidv4(),
            name: `AI: ${this.capitalize(intent.mood)} ${this.capitalize(intent.palette.split('-')[0])}`,
            category: 'AI Generated',
            ratio: '9:16' as const,
            
            // Typography
            fontFamily: intent.font,
            fontSize: intent.mood === 'aggressive' ? 80 : 64,
            fontWeight: style.fontWeight,
            lineHeight: 1.2,
            letterSpacing: intent.mood === 'elegant' ? 2 : 0,
            textTransform: style.textTransform,
            textColor: palette.text,
            activeWordColor: palette.active,
            
            // Effects
            strokeColor: 'transparent',
            strokeWidth: 0,
            shadow: intent.mood === 'impactful',
            shadowColor: 'rgba(0,0,0,0.5)',
            glow: intent.isNeon,
            glowColor: palette.active,
            glowRadius: 20,
            blur: false,
            
            // Layout
            alignment: 'center' as const,
            position: { x: 50, y: 50 },
            maxTextWidth: 85,
            safeArea: true,
            
            // Animation
            animationIn: style.animationIn,
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
                tags: [intent.mood, intent.palette, 'ai']
            }
        };

        return TemplateSchema.parse(template);
    }

    private static capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
