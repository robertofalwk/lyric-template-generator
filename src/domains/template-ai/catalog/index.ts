export const ALLOWED_FONTS = [
    'Inter',
    'Montserrat',
    'Archivo Black',
    'Playfair Display',
    'Orbitron',
    'Bebas Neue',
    'Oswald',
    'Roboto Mono',
    'Cormorant Garamond'
];

export const COLOR_PALETTES = {
    'neon-purple': {
        background: '#0a0a0c',
        text: '#f3f4f6',
        active: '#a855f7',
        accent: '#22d3ee'
    },
    'cinematic-gold': {
        background: '#09090b',
        text: '#fef3c7',
        active: '#fbbf24',
        accent: '#71717a'
    },
    'minimal-dark': {
        background: '#000000',
        text: '#ffffff',
        active: '#e5e7eb',
        accent: '#3f3f46'
    },
    'minimal-light': {
        background: '#ffffff',
        text: '#000000',
        active: '#3f3f46',
        accent: '#d1d5db'
    },
    'toxic-green': {
        background: '#050505',
        text: '#ffffff',
        active: '#4ade80',
        accent: '#166534'
    },
    'sunset-vibe': {
        background: '#1e1b4b',
        text: '#ffedd5',
        active: '#fb923c',
        accent: '#ec4899'
    }
};

export const STYLE_PRESETS = {
    'aggressive': {
        fontWeight: '900',
        textTransform: 'uppercase' as const,
        animationIn: 'zoom' as const,
        wordScaleActive: 1.2
    },
    'elegant': {
        fontWeight: '300',
        textTransform: 'none' as const,
        animationIn: 'fade' as const,
        wordScaleActive: 1
    },
    'clean': {
        fontWeight: '500',
        textTransform: 'none' as const,
        animationIn: 'slide-up' as const,
        wordScaleActive: 1
    },
    'impactful': {
        fontWeight: '700',
        textTransform: 'uppercase' as const,
        animationIn: 'slide-up' as const,
        wordScaleActive: 1.1
    }
};
