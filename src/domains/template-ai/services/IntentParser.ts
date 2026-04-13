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
    isComposite: boolean;
}

export class IntentParser {
    static parse(prompt: string): VisualIntent {
        const text = prompt.toLowerCase();
        
        let intent: VisualIntent = {
            mood: 'clean',
            palette: 'minimal-dark',
            font: 'Inter',
            backgroundMode: 'color',
            isNeon: false,
            emphasis: 'word',
            intensity: 'medium',
            platform: 'generic',
            isComposite: text.includes('+') || text.includes(' and ') || text.includes(' e ')
        };

        // 1. Genre Context
        for (const [genre, config] of Object.entries(GENRE_PRESETS)) {
            if (text.includes(genre)) {
                intent.mood = config.mood as any;
                intent.palette = config.palette as any;
                intent.font = config.font;
                intent.emphasis = config.emphasis as any;
            }
        }

        // 2. High-Priority Mood Overrides
        if (text.includes('agressivo') || text.includes('impacto') || text.includes('bold')) intent.mood = 'impactful';
        if (text.includes('elegante') || text.includes('suave') || text.includes('premium')) intent.mood = 'elegant';
        if (text.includes('retro') || text.includes('vintage')) intent.mood = 'retro';
        if (text.includes('clean') || text.includes('minimal')) intent.mood = 'clean';

        // 3. Color Logic
        if (text.includes('neon') || text.includes('cyber')) {
            intent.palette = 'cyber-punk';
            intent.isNeon = true;
        }
        if (text.includes('gold') || text.includes('dourado') || text.includes('lux')) intent.palette = 'cinematic-gold';
        if (text.includes('dark') || text.includes('escuro') || text.includes('preto')) intent.palette = 'minimal-dark';
        if (text.includes('light') || text.includes('clean') || text.includes('branco')) intent.palette = 'minimal-light';

        // 4. Dimensions & Platform
        if (text.includes('reels') || text.includes('tiktok') || text.includes('mobile')) intent.platform = 'reels';
        if (text.includes('youtube') || text.includes('widescreen') || text.includes('tv')) intent.platform = 'youtube';

        // 5. Intensity
        if (text.includes('muito') || text.includes('extremo') || text.includes('high')) intent.intensity = 'high';
        if (text.includes('sutil') || text.includes('low') || text.includes('discreto')) intent.intensity = 'low';

        // 6. Emphasis
        if (text.includes('frase') || text.includes('linha') || text.includes('line')) intent.emphasis = 'line';
        if (text.includes('palavra') || text.includes('word')) intent.emphasis = 'word';

        return intent;
    }

    static getInterpretationSummary(intent: VisualIntent): string {
        const parts = [];
        parts.push(intent.mood.toUpperCase());
        parts.push(intent.palette.split('-').join(' ').toUpperCase());
        parts.push(intent.platform !== 'generic' ? intent.platform.toUpperCase() : null);
        
        return parts.filter(Boolean).join(' • ');
    }
}
