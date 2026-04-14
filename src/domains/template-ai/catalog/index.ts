export const ALLOWED_FONTS = [
    'Inter', 'Archivo Black', 'Playfair Display', 'Orbitron', 'Montserrat', 'Roboto Mono', 
    'Outfit', 'Syne', 'Clash Display', 'Be Vietnam Pro'
];

export const COLOR_PALETTES = {
    'minimal-dark': { background: '#000000', text: '#ffffff', active: '#ffffff', accent: '#333333' },
    'minimal-light': { background: '#ffffff', text: '#000000', active: '#000000', accent: '#eeeeee' },
    'neon-purple': { background: '#0a0014', text: '#ffffff', active: '#e0aaff', accent: '#7b2cbf' },
    'toxic-green': { background: '#050a00', text: '#ffffff', active: '#00ff41', accent: '#003b00' },
    'sunset-vibe': { background: '#1a0f0f', text: '#fff0f0', active: '#ff4d4d', accent: '#ff9433' },
    'cinematic-gold': { background: '#0a0a05', text: '#fcfcfc', active: '#d4af37', accent: '#b8860b' },
    'cyber-punk': { background: '#000b1a', text: '#00f2ff', active: '#ff00ff', accent: '#001a33' },
    'earth-neutral': { background: '#1a1814', text: '#f5f5f5', active: '#d4c0a1', accent: '#5c5449' }
};

export const STYLE_PRESETS = {
    'clean': { 
        fontWeight: '400', 
        textTransform: 'none' as const, 
        wordScaleActive: 1, 
        animationIn: 'fade' as const,
        visualFx: { vignette: 0.5, chromaticAberration: 0 },
        textBehavior: { mode: 'word_by_word' as const, scrollDirection: 'none' as const },
        cameraMotion: { preset: 'zoom_drift' as const, intensity: 0.5 }
    },
    'aggressive': { 
        fontWeight: '900', 
        textTransform: 'uppercase' as const, 
        wordScaleActive: 1.2, 
        animationIn: 'zoom' as const,
        visualFx: { wordShake: true, chromaticAberration: 2, grain: 0.3 },
        textBehavior: { mode: 'word_by_word' as const, scrollDirection: 'none' as const },
        cameraMotion: { preset: 'micro_shake' as const, intensity: 1.5 }
    },
    'elegant': { 
        fontWeight: '300', 
        textTransform: 'capitalize' as const, 
        wordScaleActive: 1.05, 
        animationIn: 'slide-up' as const,
        visualFx: { wordBlurIn: true, vignette: 0.8 },
        textBehavior: { mode: 'rolling_lines' as const, scrollDirection: 'vertical' as const, maxLinesVisible: 2 },
        cameraMotion: { preset: 'parallax' as const, intensity: 0.8 }
    },
    'impactful': { 
        fontWeight: '800', 
        textTransform: 'uppercase' as const, 
        wordScaleActive: 1.1, 
        animationIn: 'zoom' as const,
        visualFx: { wordGlow: true, strokeFlash: true },
        textBehavior: { mode: 'word_by_word' as const, scrollDirection: 'none' as const },
        cameraMotion: { preset: 'push_in' as const, intensity: 1.2 }
    },
    'retro': { 
        fontWeight: '600', 
        textTransform: 'none' as const, 
        wordScaleActive: 1, 
        animationIn: 'fade' as const,
        visualFx: { grain: 0.5, vignette: 0.6 },
        textBehavior: { mode: 'karaoke_bar' as const, scrollDirection: 'none' as const },
        cameraMotion: { preset: 'dramatic_hold' as const, intensity: 1 }
    }
};

export const GENRE_PRESETS = {
    'trap': { mood: 'impactful', palette: 'minimal-dark', font: 'Archivo Black', emphasis: 'word' },
    'pop': { mood: 'clean', palette: 'sunset-vibe', font: 'Outfit', emphasis: 'word' },
    'folk': { mood: 'elegant', palette: 'earth-neutral', font: 'Syne', emphasis: 'line' },
    'techno': { mood: 'aggressive', palette: 'toxic-green', font: 'Orbitron', emphasis: 'word' },
    'lofi': { mood: 'retro', palette: 'minimal-dark', font: 'Roboto Mono', emphasis: 'line' }
};
