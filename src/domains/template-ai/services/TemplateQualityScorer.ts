import { Template } from '@/src/schemas';

export interface QualityResult {
    score: number;
    subscores: {
        contrast: number;
        readability: number;
        safety: number;
        aesthetic: number;
    };
    warnings: string[];
}

export class TemplateQualityScorer {
    static score(template: Template): QualityResult {
        const warnings: string[] = [];
        const subscores = {
            contrast: 100,
            readability: 100,
            safety: 100,
            aesthetic: 100
        };

        // 1. Perceived Contrast Ratio
        if (template.backgroundMode === 'color') {
            const contrast = this.calculateContrast(template.backgroundColor, template.textColor);
            if (contrast < 4.5) {
                subscores.contrast -= 50;
                warnings.push('Poor text contrast (WCAG alert)');
            }
        }

        // 2. Mobile Readability (Font Size & Tracking)
        if (template.fontSize < 32) {
            subscores.readability -= 30;
            warnings.push('Font size too small for mobile (min 32px recommended)');
        }
        if (template.letterSpacing < -1) {
            subscores.readability -= 20;
            warnings.push('Negative tracking might crush letters');
        }

        // 3. Screen Safety (Safe Area for Social Platforms)
        // Values are percentages
        if (template.position.y > 80) {
            subscores.safety -= 40;
            warnings.push('Bottom occlusion risk (overlap with platform UI)');
        }
        if (template.position.y < 15) {
            subscores.safety -= 30;
            warnings.push('Top occlusion risk (overlap with camera/info)');
        }
        if (template.maxTextWidth > 90) {
            subscores.safety -= 20;
            warnings.push('Horizontal safe-zone violation');
        }

        // 4. Aesthetic Consistency
        if (template.glow && !template.shadow) {
            subscores.aesthetic -= 10;
            warnings.push('Glow without shadow might look washed out');
        }
        if (template.animationIn === 'none') {
            subscores.aesthetic -= 20;
            warnings.push('Static entries feel less premium');
        }

        const score = Math.round(
            (subscores.contrast * 0.35) + 
            (subscores.readability * 0.30) + 
            (subscores.safety * 0.25) + 
            (subscores.aesthetic * 0.10)
        );

        return {
            score: Math.max(0, score),
            subscores,
            warnings
        };
    }

    private static calculateContrast(rgb1: string, rgb2: string): number {
        const l1 = this.getLuminance(rgb1);
        const l2 = this.getLuminance(rgb2);
        const brightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    private static getLuminance(hex: string): number {
        const c = hex.replace('#', '');
        if (c === 'transparent' || c === 'rgba(0,0,0,0)') return 0;
        
        let r, g, b;
        if (c.length === 3) {
            r = parseInt(c[0] + c[0], 16) / 255;
            g = parseInt(c[1] + c[1], 16) / 255;
            b = parseInt(c[2] + c[2], 16) / 255;
        } else {
            r = parseInt(c.slice(0, 2), 16) / 255;
            g = parseInt(c.slice(2, 4), 16) / 255;
            b = parseInt(c.slice(4, 6), 16) / 255;
        }

        const a = [r, g, b].map(v => {
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
}
