import { renderMedia, bundle } from '@remotion/renderer';
import { Project, Template, ProjectScene } from '@/src/schemas';
import { TemplateService } from '../templates/TemplateService';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import path from 'path';
import fs from 'fs/promises';

export class RenderingService {
    async render(
        project: Project, 
        jobId: string, 
        customTemplate?: Template,
        onProgress: (progress: number, log: string) => void
    ) {
        const outputDir = path.join(process.cwd(), 'storage', 'renders', jobId);
        await fs.mkdir(outputDir, { recursive: true });
        
        const mp4Path = path.join(outputDir, 'video.mp4');
        const entryPoint = path.join(process.cwd(), 'remotion', 'Root.tsx');
        
        // 1. Resolve Global Baseline
        const globalTemplate = customTemplate || await TemplateService.resolve(project.selectedTemplateId || '');
        
        // 2. Fetch Scenes
        const scenes = await projectSceneRepository.findByProjectId(project.id);
        
        // 3. Resolve Scene Assets
        const sceneManifest = await Promise.all(scenes.map(async s => {
            let assetUrl = null;
            if (s.backgroundAssetId) {
                const asset = await backgroundAssetRepository.findById(s.backgroundAssetId);
                assetUrl = asset ? `http://localhost:3000${asset.publicPath}` : null;
            }
            
            let sceneTemplate = null;
            if (s.templateId) {
                sceneTemplate = await TemplateService.resolve(s.templateId);
            }

            return {
                ...s,
                assetUrl,
                template: sceneTemplate
            };
        }));

        onProgress(5, 'Bundling V5 Modular Architecture...');
        const bundleLocation = await bundle({ entryPoint });

        onProgress(20, 'Initializing Scene Master...');

        try {
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
                    // V5 Master Payload
                    globalTemplate,
                    scenes: sceneManifest,
                    fps: 30
                },
                codec: 'h264',
                onProgress: ({ progress }) => {
                    const mappedProgress = 20 + (progress * 80);
                    onProgress(Math.floor(mappedProgress), `Slicing & Mastering: ${Math.floor(progress * 100)}%`);
                }
            });
            
            const publicExport = path.join(process.cwd(), 'public', 'exports', `${jobId}.mp4`);
            await fs.mkdir(path.dirname(publicExport), { recursive: true });
            await fs.copyFile(mp4Path, publicExport);

            return `/exports/${jobId}.mp4`;
        } catch (error: any) {
            console.error('[RenderingService] V5 Scene Error:', error);
            throw error;
        }
    }

    private calculateDuration(project: Project): number {
        if (!project.timeline || !project.timeline.segments.length) return 900; 
        const lastEndMs = Math.max(...project.timeline.segments.map(s => s.endMs));
        return Math.ceil((lastEndMs / 1000) * 30) + (2 * 30); // Buffer
    }
}

export const renderingService = new RenderingService();
