import { Timeline, ProjectScene, Template, Project } from '@/src/schemas';
import { v4 as uuid } from 'uuid';
import { TEMPLATES_REGISTRY } from '../../templates/registry';

export interface VisualDirectionManifest {
    scenes: {
        name: string;
        startMs: number;
        endMs: number;
        mood: string;
        suggestedTemplateId: string;
        backgroundPrompt: string;
    }[];
}

export class VisualDirectorService {
    /**
     * Auto-directs a project by analyzing lyrics and partitioning into scenes.
     */
    static async direct(project: Project, timeline: Timeline): Promise<ProjectScene[]> {
        // For V7, we implement a smart partitioning logic
        // We look for gaps in timeline > 1s or segments count
        const scenes: ProjectScene[] = [];
        const segments = timeline.segments;
        
        if (segments.length === 0) return [];

        // Simple heuristic for Phase 1: Create a scene for every 4 segments
        // or based on significant gaps.
        let currentSceneSegments: typeof segments = [];
        let sceneIndex = 1;

        const flushScene = (segs: typeof segments) => {
            if (segs.length === 0) return;
            const start = segs[0].startMs;
            const end = segs[segs.length - 1].endMs;
            
            // Heuristic Template Selection:
            // Intro -> Luxury
            // Mid -> Kinetic or Social
            // High intensity words -> Aggressive
            let templateId = 'minimal-clean';
            if (sceneIndex === 1) templateId = 'luxury-minimal-motion';
            else if (sceneIndex % 2 === 0) templateId = 'kinetic-neon';
            else templateId = 'social-reels-bold';

            scenes.push({
                id: uuid(),
                projectId: project.id,
                name: `Scene ${sceneIndex}: ${segs[0].text.slice(0, 20)}...`,
                startMs: start,
                endMs: end,
                sectionType: sceneIndex === 1 ? 'intro' : 'verse',
                templateId,
                intensity: 'medium',
                transitionIn: 'fade',
                transitionOut: 'fade',
                settings: {},
                createdAt: new Date().toISOString()
            });
            sceneIndex++;
        };

        for (let i = 0; i < segments.length; i++) {
            currentSceneSegments.push(segments[i]);
            
            const isLast = i === segments.length - 1;
            const gap = !isLast ? segments[i+1].startMs - segments[i].endMs : 0;
            
            if (currentSceneSegments.length >= 4 || gap > 1500 || isLast) {
                flushScene(currentSceneSegments);
                currentSceneSegments = [];
            }
        }

        return scenes;
    }
}
