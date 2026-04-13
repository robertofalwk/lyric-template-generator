import { renderMedia, bundle } from '@remotion/renderer';
import { Project } from '@/src/schemas';
import { TemplateService } from '../templates/TemplateService';
import path from 'path';
import fs from 'fs/promises';

export class RenderingService {
    async render(
        project: Project, 
        jobId: string, 
        customTemplate?: any,
        onProgress: (progress: number, log: string) => void
    ) {
        const outputDir = path.join(process.cwd(), 'storage', 'renders', jobId);
        await fs.mkdir(outputDir, { recursive: true });
        
        const mp4Path = path.join(outputDir, 'video.mp4');
        const entryPoint = path.join(process.cwd(), 'remotion', 'Root.tsx');
        
        // Resolve Template
        const template = customTemplate || TemplateService.resolve(project.selectedTemplateId);

        onProgress(5, 'Bundling Remotion project...');
        const bundleLocation = await bundle({ entryPoint });

        onProgress(20, 'Starting render engine...');

        try {
            // Important: Use a URL that Remotion can reach. 
            // In a local worker, we point to the local API.
            const audioSrc = `http://localhost:3000/api/projects/${project.id}/audio`;

            await renderMedia({
                composition: {
                    id: project.aspectRatio === '16:9' ? 'LyricVideoLandscape' : 'LyricVideo',
                    width: project.aspectRatio === '9:16' ? 1080 : 1920,
                    height: project.aspectRatio === '9:16' ? 1920 : 1080,
                    fps: 30,
                    durationInFrames: this.calculateDuration(project),
                },
                serveUrl: bundleLocation,
                outputLocation: mp4Path,
                inputProps: { 
                    audioSrc,
                    timeline: project.timeline,
                    template
                },
                codec: 'h264',
                onProgress: ({ progress }) => {
                    const mappedProgress = 20 + (progress * 80);
                    onProgress(Math.floor(mappedProgress), `Rendering: ${Math.floor(progress * 100)}%`);
                }
            });
            
            const publicExport = path.join(process.cwd(), 'public', 'exports', `${jobId}.mp4`);
            await fs.mkdir(path.dirname(publicExport), { recursive: true });
            await fs.copyFile(mp4Path, publicExport);

            return `/exports/${jobId}.mp4`;
        } catch (error: any) {
            console.error('[RenderingService] Error:', error);
            throw error;
        }
    }

    private calculateDuration(project: Project): number {
        if (!project.timeline || project.timeline.segments.length === 0) return 900; 
        const lastEndMs = Math.max(...project.timeline.segments.map(s => s.endMs));
        return Math.ceil((lastEndMs / 1000) * 30) + 60; 
    }
}

export const renderingService = new RenderingService();
