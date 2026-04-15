import { Project, ProjectScene } from '@/src/schemas';

export interface GateResult {
    passed: boolean;
    issues: {
        severity: 'blocking' | 'warning';
        message: string;
        category: string;
    }[];
}

export class ProjectQualityGateService {
    static validateForRender(project: Project, scenes: ProjectScene[]): GateResult {
        const issues: GateResult['issues'] = [];

        // 1. Structural Checks
        if (!project.timeline) {
            issues.push({ severity: 'blocking', message: 'Timeline data missing', category: 'structure' });
        }
        if (scenes.length === 0) {
            issues.push({ severity: 'blocking', message: 'No scenes defined', category: 'structure' });
        }

        // 2. Visual Health Checks
        if ((project.lastVisualScore || 0) < 60) {
            issues.push({ severity: 'warning', message: 'Global visual health is below studio standard (Min 60)', category: 'aesthetic' });
        }

        const lowScoreScenes = scenes.filter(s => (s.visualScore || 0) < 50);
        if (lowScoreScenes.length > 0) {
            issues.push({ severity: 'warning', message: `${lowScoreScenes.length} scene(s) have critically low scores`, category: 'aesthetic' });
        }

        // 3. Logic Gaps
        const gaps = this.detectGaps(scenes);
        if (gaps.length > 0) {
            issues.push({ severity: 'warning', message: 'Chronological gaps detected in scene timeline', category: 'logic' });
        }

        return {
            passed: !issues.some(i => i.severity === 'blocking'),
            issues
        };
    }

    private static detectGaps(scenes: ProjectScene[]): number[] {
        if (scenes.length < 2) return [];
        const sorted = [...scenes].sort((a,b) => a.startMs - b.startMs);
        const gaps: number[] = [];
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].endMs < sorted[i+1].startMs - 500) { // Tolerate 500ms
                gaps.push(i);
            }
        }
        return gaps;
    }
}
