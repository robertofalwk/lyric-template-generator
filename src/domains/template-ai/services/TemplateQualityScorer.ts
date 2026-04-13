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
    /**
     * V6.2 Reconciled Quality Scorer
     * Operates exclusively on fields guaranteed by the Master Schema
     */
    static score(template: Template): QualityResult {
        const warnings: string[] = [];
        const recommendations: string[] = [];
        const subscores = {
            contrast: 100,
            readability: 100,
            safety: 100,
            assetCoherence: 100
        };

        // 1. WCAG Contrast Check (Master Schema: textColor, backgroundColor)
        const contrast = this.calculateContrast(template.backgroundColor, template.textColor);
        if (contrast < 4.1) { // Production Threshold
            subscores.contrast -= 50;
            warnings.push('Low Contrast Detected: Risk of unreadable segments');
            recommendations.push('Try lightening text or and adding a background dark overlay');
        }

        // 2. High-Fidelity Asset Coherence (V6.2: backgroundMode, backgroundOverlayOpacity)
        if (template.backgroundMode === 'image' || template.backgroundMode === 'video') {
            if (template.backgroundOverlayOpacity < 0.4) {
                subscores.assetCoherence -= 40;
                warnings.push('High Detail Conflict: Background may compete with lyrics');
                recommendations.push('Increase backgroundOverlayOpacity to at least 0.4');
            }
        }

        // 3. Platform Safety Safe-Zones (V6.2: position.y)
        if (template.position.y > 80) {
            subscores.safety -= 40;
            warnings.push('Social UI Occlusion Risk: Text overlaps TikTok/Reels controls');
            recommendations.push('Shift vertical position (y) to 75 or lower');
        }

        // 4. Readability Risks (V6.2: glow, glowRadius, blur)
        if (template.glow && (template.glowRadius || 0) > 35) {
            subscores.readability -= 25;
            warnings.push('Glow Saturation: Halo effect is compromising word boundaries');
        }

        if (template.blur) {
            subscores.readability -= 10;
        }

        const score = Math.round(
            (subscores.contrast * 0.35) + 
            (subscores.readability * 0.25) + 
            (subscores.safety * 0.20) + 
            (subscores.assetCoherence * 0.20)
        );

        return {
            score: Math.max(0, score),
            subscores,
            warnings,
            recommendations
        };
    }

    private static calculateContrast(hex1: string, hex2: string): number {
        try {
            const l1 = this.getLuminance(hex1);
            const l2 = this.getLuminance(hex2);
            const brightest = Math.max(l1, l2);
            const darkest = Math.min(l1, l2);
            return (brightest + 0.05) / (darkest + 0.05);
        } catch (e) { return 5; } // Fallback to safe score on parsing error
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
