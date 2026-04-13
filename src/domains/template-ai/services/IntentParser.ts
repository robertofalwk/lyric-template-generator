import { ALLOWED_FONTS, COLOR_PALETTES, STYLE_PRESETS, GENRE_PRESETS } from '../catalog';

export interface VisualIntent {
    mood: keyof typeof STYLE_PRESETS;
    palette: keyof typeof COLOR_PALETTES;
    font: string;
    backgroundMode: 'color' | 'blur' | 'transparent';
    isNeon: boolean;
    emphasis: 'word' | 'line';
    intensity: 'low' | 'medium' | 'high';
    platform: 'reels' | 'youtube' | 'generic';
}

export class IntentParser {
    static parse(prompt: string): VisualIntent {
        const text = prompt.toLowerCase();
        
        // Defaults
        let intent: VisualIntent = {
            mood: 'clean',
            palette: 'minimal-dark',
            font: 'Inter',
            backgroundMode: 'color',
            isNeon: false,
            emphasis: 'word',
            intensity: 'medium',
            platform: 'generic'
        };

        // 1. Genre Inference
        for (const [genre, config] of Object.entries(GENRE_PRESETS)) {
            if (text.includes(genre)) {
                intent.mood = config.mood as any;
                intent.palette = config.palette as any;
                intent.font = config.font;
                intent.emphasis = config.emphasis as any;
            }
        }

        // 2. Specific Mood detection (Overwrites genre)
        if (text.includes('agressivo') || text.includes('impacto')) intent.mood = 'impactful';
        if (text.includes('elegante') || text.includes('suave') || text.includes('premium')) intent.mood = 'elegant';
        if (text.includes('retro') || text.includes('antigo')) intent.mood = 'retro';

        // 3. Palette Adjustments
        if (text.includes('neon') || text.includes('cybe')) {
            intent.palette = 'cyber-punk';
            intent.isNeon = true;
        }
        if (text.includes('roxo') || text.includes('purple')) intent.palette = 'neon-purple';
        if (text.includes('ouro') || text.includes('gold') || text.includes('dourado')) intent.palette = 'cinematic-gold';
        if (text.includes('quente') || text.includes('vermelho') || text.includes('sunset')) intent.palette = 'sunset-vibe';

        // 4. Dimensions
        if (text.includes('reels') || text.includes('tiktok') || text.includes('short')) intent.platform = 'reels';
        if (text.includes('youtube') || text.includes('widescreen')) intent.platform = 'youtube';

        if (text.includes('brilhante') || text.includes('muito')) intent.intensity = 'high';
        if (text.includes('discreto') || text.includes('pouco')) intent.intensity = 'low';

        // 5. Layout
        if (text.includes('frase') || text.includes('legenda')) intent.emphasis = 'line';
        if (text.includes('fundo desfocado') || text.includes('blur')) intent.backgroundMode = 'blur';
        if (text.includes('transparente')) intent.backgroundMode = 'transparent';

        return intent;
    }

    static getInterpretationSummary(intent: VisualIntent): string {
        return `Mood: ${intent.mood}, Palette: ${intent.palette}, Focus: ${intent.emphasis}`;
    }
}
