import { Timeline, ProjectScene } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';

export class SceneDetectionService {
    static detect(projectId: string, timeline: Timeline): ProjectScene[] {
        if (!timeline.segments || timeline.segments.length === 0) return [];

        const scenes: ProjectScene[] = [];
        const segments = timeline.segments;
        
        // 1. Detect Intro (if music starts after 2s)
        if (segments[0].startMs > 2000) {
            scenes.push(this.createScene(projectId, 'Intro', 0, segments[0].startMs, 'intro'));
        }

        // 2. Simple Heuristic: Split by line count (e.g. 8 lines per verse)
        const chunkSize = 8;
        for (let i = 0; i < segments.length; i += chunkSize) {
            const chunk = segments.slice(i, i + chunkSize);
            const start = chunk[0].startMs;
            const end = chunk[chunk.length - 1].endMs;
            
            const isChorus = i === chunkSize; // Just an example heuristic: second chunk is chorus
            
            scenes.push(this.createScene(
                projectId, 
                isChorus ? 'Chorus 1' : `Verse ${Math.floor(i / chunkSize) + 1}`,
                start, 
                end, 
                isChorus ? 'chorus' : 'verse'
            ));
        }

        // 3. Detect Outro (if video continues after last word)
        const lastEnd = segments[segments.length - 1].endMs;
        scenes.push(this.createScene(projectId, 'Outro', lastEnd, lastEnd + 5000, 'outro'));

        return scenes;
    }

    private static createScene(projectId: string, name: string, startMs: number, endMs: number, type: any): ProjectScene {
        return {
            id: uuidv4(),
            projectId,
            name,
            startMs,
            endMs,
            sectionType: type,
            intensity: type === 'chorus' ? 'high' : 'medium',
            transitionIn: 'fade',
            transitionOut: 'fade',
            settings: {},
            createdAt: new Date().toISOString()
        };
    }
}
