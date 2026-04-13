import { Template } from '@/src/schemas';

export class TemplateQualityScorer {
    static score(template: Template): number {
        let score = 100;

        // Contrast Check (Mock simplified)
        // Check if text color and background color are too similar
        if (template.textColor.toLowerCase() === template.backgroundColor.toLowerCase() && template.backgroundMode === 'color') {
            score -= 50; 
        }

        // Font Size Safety
        if (template.fontSize < 24) score -= 20;
        if (template.fontSize > 120 && template.ratio === '9:16') score -= 15; // Too big for mobile

        // Legendability (Glow abuse)
        if (template.glow && (template.glowRadius || 0) > 40) score -= 10;

        // Position Safety
        if (template.position.y > 90 || template.position.y < 10) score -= 15; // Hidden behind UI or notch
        if (template.position.x > 90 || template.position.x < 10) score -= 15;

        // Safe Area check
        if (!template.safeArea && template.alignment !== 'center') score -= 5;

        return Math.max(0, score);
    }

    static getExplanation(score: number): string {
        if (score > 85) return 'Excellent readability and composition.';
        if (score > 70) return 'Solid layout with minor usability risks.';
        if (score > 50) return 'Poor contrast or font sizing. May be hard to read on mobile.';
        return 'Critical visibility issues detected.';
    }
}
