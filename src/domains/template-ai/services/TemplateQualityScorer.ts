import { Template } from '@/src/schemas';

export interface QualityResult {
    score: number;
    subscores: {
        contrast: number;
        usability: number;
        safety: number;
        expressiveness: number;
    };
    warnings: string[];
}

export class TemplateQualityScorer {
    static score(template: Template): QualityResult {
        const warnings: string[] = [];
        const subscores = {
            contrast: 100,
            usability: 100,
            safety: 100,
            expressiveness: 100
        };

        // 1. Contrast Logic (Simplified Relative Luminance)
        if (template.backgroundMode === 'color') {
            const isDarkBg = this.isColorDark(template.backgroundColor);
            const isDarkText = this.isColorDark(template.textColor);
            if (isDarkBg === isDarkText) {
                subscores.contrast -= 60;
                warnings.push('Low text contrast against background.');
            }
        }

        // 2. Usability (Accessibility)
        if (template.fontSize < 30) {
            subscores.usability -= 30;
            warnings.push('Font size is too small for mobile readability.');
        }
        if (template.glow && (template.glowRadius || 0) > 40) {
            subscores.usability -= 20;
            warnings.push('Excessive glow radius may cause "blooming" blur.');
        }

        // 3. Safety (Screen bounds)
        if (template.position.y > 85 || template.position.y < 15) {
            subscores.safety -= 40;
            warnings.push('Text is too close to screen edges (Safe Area risk).');
        }
        if (template.maxTextWidth > 95) {
            subscores.safety -= 20;
            warnings.push('Text width may exceed horizontal bounds on some devices.');
        }

        // 4. Expressiveness 
        if (template.animationIn === 'none') subscores.expressiveness -= 10;
        if (template.lineHeight < 1) subscores.expressiveness -= 15;

        const score = Math.round(
            (subscores.contrast * 0.4) + 
            (subscores.usability * 0.3) + 
            (subscores.safety * 0.2) + 
            (subscores.expressiveness * 0.1)
        );

        return {
            score: Math.max(0, score),
            subscores,
            warnings
        };
    }

    private static isColorDark(color: string): boolean {
        // Simple hex/rgba dark detection
        const c = color.replace('#', '');
        if (c === 'transparent') return false;
        
        // Convert to RGB
        let r, g, b;
        if (c.length === 3) {
            r = parseInt(c[0] + c[0], 16);
            g = parseInt(c[1] + c[1], 16);
            b = parseInt(c[2] + c[2], 16);
        } else {
            r = parseInt(c.slice(0, 2), 16);
            g = parseInt(c.slice(2, 4), 16);
            b = parseInt(c.slice(4, 6), 16);
        }

        // Perceived brightness
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }
}
