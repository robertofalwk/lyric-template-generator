import { renderMedia, bundle } from '@remotion/renderer';
import { Project } from '@/src/schemas';
import path from 'path';
import fs from 'fs/promises';

export class RenderingService {
    async render(
        project: Project, 
        jobId: string, 
        onProgress: (progress: number, log: string) => void
    ) {
        const outputDir = path.join(process.cwd(), 'storage', 'renders', jobId);
        await fs.mkdir(outputDir, { recursive: true });
        
        const mp4Path = path.join(outputDir, 'video.mp4');
        const entryPoint = path.join(process.cwd(), 'remotion', 'Root.tsx');

        onProgress(5, 'Bundling Remotion project...');
        
        const bundleLocation = await bundle({
            entryPoint,
            // Add any other bundling options if needed
        });

        onProgress(20, 'Starting render engine...');

        try {
            await renderMedia({
                composition: {
                    id: 'LyricVideo',
                    width: project.aspectRatio === '9:16' ? 1080 : 1920,
                    height: project.aspectRatio === '9:16' ? 1920 : 1080,
                    fps: 30,
                    durationInFrames: this.calculateDuration(project),
                },
                serveUrl: bundleLocation,
                outputLocation: mp4Path,
                inputProps: { 
                    audioSrc: `http://localhost:3000/api/projects/${project.id}/audio`, // External URL or local file
                    timeline: project.timeline,
                    template: project.template
                },
                codec: 'h264',
                onProgress: ({ progress }) => {
                    const mappedProgress = 20 + (progress * 80);
                    onProgress(Math.floor(mappedProgress), `Rendering: ${Math.floor(progress * 100)}%`);
                }
            });
            
            // Move to public for export
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
        if (!project.timeline || project.timeline.segments.length === 0) return 900; // 30s default
        const lastSegments = project.timeline.segments;
        const lastEndMs = Math.max(...lastSegments.map(s => s.endMs));
        return Math.ceil((lastEndMs / 1000) * 30) + 60; // +2s buffer
    }
}

export const renderingService = new RenderingService();
