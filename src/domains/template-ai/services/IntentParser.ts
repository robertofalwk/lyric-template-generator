import { ALLOWED_FONTS, COLOR_PALETTES, STYLE_PRESETS } from '../catalog';

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
        let mood: keyof typeof STYLE_PRESETS = 'clean';
        let palette: keyof typeof COLOR_PALETTES = 'minimal-dark';
        let font = 'Inter';
        let backgroundMode: 'color' | 'blur' | 'transparent' = 'color';
        let isNeon = false;
        let emphasis: 'word' | 'line' = 'word';
        let intensity: 'low' | 'medium' | 'high' = 'medium';
        let platform: 'reels' | 'youtube' | 'generic' = 'generic';

        // Mood & Category detection
        if (text.includes('agressivo') || text.includes('impacto') || text.includes('trap') || text.includes('funke')) mood = 'aggressive';
        if (text.includes('elegante') || text.includes('suave') || text.includes('luxury') || text.includes('serif')) mood = 'elegant';
        if (text.includes('cyber') || text.includes('futurist') || text.includes('neon')) mood = 'aggressive'; 
        if (text.includes('clean') || text.includes('minimal') || text.includes('moderno')) mood = 'clean';

        // Intensity detection
        if (text.includes('calmo') || text.includes('discreto') || text.includes('leve')) intensity = 'low';
        if (text.includes('extremo') || text.includes('gritoso') || text.includes('brilhando muito')) intensity = 'high';

        // Palette detection
        if (text.includes('neon') || text.includes('roxo') || text.includes('cyan')) {
            palette = 'neon-purple';
            isNeon = true;
        }
        if (text.includes('dourado') || text.includes('gold') || text.includes('premium')) palette = 'cinematic-gold';
        if (text.includes('branco') || text.includes('light')) palette = 'minimal-light';
        if (text.includes('sunset') || text.includes('vermelho')) palette = 'sunset-vibe';
        if (text.includes('matrix') || text.includes('verde')) palette = 'toxic-green';

        // Font suggestion
        if (mood === 'aggressive') font = 'Archivo Black';
        if (mood === 'elegant') font = 'Playfair Display';
        if (isNeon) font = 'Orbitron';
        if (text.includes('manuscrito') || text.includes('cursive')) font = 'Montserrat';
        if (text.includes('techno')) font = 'Orbitron';

        // Background / Effects
        if (text.includes('blur') || text.includes('fundo desfocado')) backgroundMode = 'blur';
        if (text.includes('transparente') || text.includes('reels')) backgroundMode = 'transparent';
        if (text.includes('legendas') || text.includes('frase')) emphasis = 'line';

        // Platform
        if (text.includes('reels') || text.includes('shorts') || text.includes('tiktok')) platform = 'reels';
        if (text.includes('hd') || text.includes('cinema')) platform = 'youtube';

        return { mood, palette, font, backgroundMode, isNeon, emphasis, intensity, platform };
    }
}
