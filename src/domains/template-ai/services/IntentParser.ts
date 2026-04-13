import { ALLOWED_FONTS, COLOR_PALETTES, STYLE_PRESETS } from '../catalog';

export interface VisualIntent {
    mood: keyof typeof STYLE_PRESETS;
    palette: keyof typeof COLOR_PALETTES;
    font: string;
    backgroundMode: 'color' | 'blur' | 'transparent';
    isNeon: boolean;
    emphasis: 'word' | 'line';
}

export class IntentParser {
    static parse(prompt: string): VisualIntent {
        const text = prompt.toLowerCase();
        
        // Defaults
        let mood: keyof typeof STYLE_PRESETS = 'clean';
        let palette: keyof typeof COLOR_PALETTES = 'minimal-dark';
        let font = 'Inter';
        let backgroundMode: 'color' | 'blur' | 'transparent' = 'color';
        let isNeon = false;
        let emphasis: 'word' | 'line' = 'word';

        // Mood detection
        if (text.includes('agressivo') || text.includes('impacto') || text.includes('trap')) mood = 'aggressive';
        if (text.includes('elegante') || text.includes('suave') || text.includes('clássico')) mood = 'elegant';
        if (text.includes('moderno') || text.includes('clean')) mood = 'clean';
        if (text.includes('reels') || text.includes('tiktok')) mood = 'impactful';

        // Palette detection
        if (text.includes('neon') || text.includes('roxo') || text.includes('cyberpunk')) {
            palette = 'neon-purple';
            isNeon = true;
        }
        if (text.includes('dourado') || text.includes('cinema') || text.includes('premium')) palette = 'cinematic-gold';
        if (text.includes('branco') || text.includes('claro')) palette = 'minimal-light';
        if (text.includes('sunset') || text.includes('quente')) palette = 'sunset-vibe';
        if (text.includes('verde') || text.includes('tóxico')) palette = 'toxic-green';

        // Font suggestion
        if (mood === 'aggressive') font = 'Archivo Black';
        if (mood === 'elegant') font = 'Cormorant Garamond';
        if (isNeon) font = 'Orbitron';
        if (text.includes('serif')) font = 'Playfair Display';
        if (text.includes('mono')) font = 'Roboto Mono';

        // Background / Effects
        if (text.includes('blur') || text.includes('fundo desfocado')) backgroundMode = 'blur';
        if (text.includes('transparente') || text.includes('reels')) backgroundMode = 'transparent';
        if (text.includes('linha') || text.includes('frase')) emphasis = 'line';

        return { mood, palette, font, backgroundMode, isNeon, emphasis };
    }
}
