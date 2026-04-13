import { Template } from '@/src/schemas';
import { TemplateQualityScorer } from './TemplateQualityScorer';

export type AutoFixMode = 'soft' | 'aggressive';

export class TemplateAutoFixService {
    static apply(template: Template, mode: AutoFixMode = 'soft'): Template {
        const result = TemplateQualityScorer.score(template);
        if (result.score > 90) return template; // Already good

        let fixed = { ...template };

        // Fix 1: Bottom Safety (Strict social media requirements)
        if (fixed.position.y > 80) {
            fixed.position = { ...fixed.position, y: 75 };
        }

        // Fix 2: Background contrast for asset modes
        if (fixed.backgroundMode === 'image' || fixed.backgroundMode === 'video') {
            if (fixed.backgroundOverlayOpacity < 0.4) {
                fixed.backgroundOverlayOpacity = mode === 'aggressive' ? 0.6 : 0.45;
                fixed.backgroundOverlayColor = '#000000';
            }
        }

        // Fix 3: Tiny font
        if (fixed.fontSize < 32) {
            fixed.fontSize = 32;
        }

        // Fix 4: Extreme Glow radius (Blur risk)
        if (fixed.glow && fixed.glowRadius && fixed.glowRadius > 40) {
            fixed.glowRadius = 25;
        }

        return fixed;
    }
}
