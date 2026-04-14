import { Timeline, ProjectScene, Template, Project } from '@/src/schemas';
import { v4 as uuid } from 'uuid';
import { TEMPLATES_REGISTRY } from '../../templates/registry';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';
import { TemplateAIProviderFactory } from '../providers/TemplateAIProviderFactory';

export interface VisualDirectionManifest {
    visual_intent: {
        mood: string;
        colorPalette: string;
        overallPacing: string;
    };
    super_template: {
        baseTemplateId: string;
        textBehaviorOverride?: string;
        cameraMotionOverride?: string;
    };
    scene_manifest: {
        id: string;
        name: string;
        startMs: number;
        endMs: number;
        energy: string;
        sectionType: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
    }[];
    art_allocation: {
        sceneId: string;
        prompt: string;
        visualIntensity: 'low' | 'medium' | 'high';
    }[];
}

export class VisualDirectorService {
    static async direct(project: Project, timeline: Timeline): Promise<ProjectScene[]> {
        const provider = TemplateAIProviderFactory.getProvider();
        
        const aiManifest = await provider.directVisuals(project, timeline);
        if (aiManifest && aiManifest.scene_manifest && aiManifest.scene_manifest.length > 0) {
            // Fetch assets for fallback mapping
            const availableAssets = await backgroundAssetRepository.findAll();

            return aiManifest.scene_manifest.map((s: any, idx: number) => {
                const art = aiManifest.art_allocation?.find((a: any) => a.sceneId === s.id);
                
                // Basic heuristic: try to pick an asset (round robin) if any exist
                const assetId = availableAssets.length > 0 
                    ? availableAssets[idx % availableAssets.length].id 
                    : undefined;

                return {
                    id: uuid(),
                    projectId: project.id,
                    name: s.name,
                    startMs: s.startMs,
                    endMs: s.endMs,
                    sectionType: s.sectionType || 'verse',
                    templateId: aiManifest.super_template?.baseTemplateId || 'kinetic-neon',
                    backgroundAssetId: assetId,
                    intensity: art?.visualIntensity || s.energy || 'medium',
                    transitionIn: 'fade',
                    transitionOut: 'fade',
                    settings: {
                        prompt: art?.prompt,
                        visual_intent: aiManifest.visual_intent
                    },
                    createdAt: new Date().toISOString()
                };
            });
        }

        // If provider returned null and it's not OpenAI, we proceed to heuristics.
        // If it's OpenAI and it didn't throw but returned null (not expected), we'll do heuristics.
        // But if it THREW, it will bubble up and the API will return 500.
        
        // --- FALLBACK HEURISTIC ---
        const scenes: ProjectScene[] = [];
        const segments = timeline.segments;
        if (segments.length === 0) return [];

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
