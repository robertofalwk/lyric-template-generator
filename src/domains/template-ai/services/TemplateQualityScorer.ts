import { Template } from '@/src/schemas';

export interface QualityResult {
    score: number;
    subscores: {
        contrast: number;
        readability: number;
        safety: number;
        assetCoherence: number;
    };
    warnings: string[];
    recommendations: string[];
}

export class TemplateQualityScorer {
    static score(template: Template): QualityResult {
        const warnings: string[] = [];
        const recommendations: string[] = [];
        const subscores = {
            contrast: 100,
            readability: 100,
            safety: 100,
            assetCoherence: 100
        };

        // 1. WCAG Contrast Check
        const contrast = this.calculateContrast(template.backgroundColor, template.textColor);
        if (contrast < 4.5) {
            subscores.contrast -= 50;
            warnings.push('Critical Contrast Failure (below WCAG 4.5:1)');
            recommendations.push('Try lightening text or darkening background');
        }

        // 2. Asset coherence (V4)
        if (template.backgroundMode === 'image' || template.backgroundMode === 'video') {
            if (template.backgroundOverlayOpacity < 0.3) {
                subscores.assetCoherence -= 40;
                warnings.push('Low Legibility Risk: High background detail conflict');
                recommendations.push('Increase Overlay Opacity (min 0.3 recommended)');
            }
        }

        // 3. Safety for social
        if (template.position.y > 82) {
            subscores.safety -= 40;
            warnings.push('Bottom occlusion risk (TikTok/Reels UI overlap)');
            recommendations.push('Raise vertical position (y) to < 80');
        }

        // 4. Motion / Glow risks
        if (template.glow && (template.glowRadius || 0) > 30) {
            subscores.readability -= 20;
            warnings.push('Glow Blur: Text clarity compromised by large radius');
        }

        const score = Math.round(
            (subscores.contrast * 0.3) + 
            (subscores.readability * 0.3) + 
            (subscores.safety * 0.2) + 
            (subscores.assetCoherence * 0.2)
        );

        return {
            score: Math.max(0, score),
            subscores,
            warnings,
            recommendations
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
        if (c === 'transparent' || c.length < 3) return 0;
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
        const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
}
