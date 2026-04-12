import { renderMedia, selectComposition } from '@remotion/renderer';
import { Storage } from './storage';
import path from 'path';
import fs from 'fs/promises';
import { ExportJob } from '@/types';

class RenderWorker {
    private isRunning = false;

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('🚀 Render Worker started');
        this.loop();
    }

    private async loop() {
        while (this.isRunning) {
            try {
                const jobs = await Storage.getJobs();
                const nextJob = jobs.find(j => j.status === 'queued');

                if (nextJob) {
                    await this.processJob(nextJob);
                }
            } catch (err) {
                console.error('Queue Loop Error:', err);
            }
            await new Promise(r => setTimeout(r, 5000)); // Poll every 5s
        }
    }

    private async processJob(job: ExportJob) {
        console.log(`[Job ${job.id}] Processing...`);
        try {
            await Storage.updateJob(job.id, { status: 'processing', progress: 10 });
            
            const project = await Storage.getProject(job.projectId);
            if (!project) throw new Error('Project not found');

            const outputDir = path.join(process.cwd(), 'storage', 'renders', job.id);
            await fs.mkdir(outputDir, { recursive: true });

            // 1. Export MP4 if requested
            if (job.formats.includes('mp4')) {
                const mp4Output = path.join(outputDir, 'video.mp4');
                // Note: In real setup, we must bundle remotion before render
                // For this mock/MVP, we'll log the intention
                console.log(`Rendering Remotion to ${mp4Output}...`);
                
                // Real call would be:
                // await renderMedia({ ... })
                
                // Copy to public for access
                const publicPath = path.join(process.cwd(), 'public', 'exports', `${job.id}.mp4`);
                await fs.copyFile(mp4Output, publicPath);
                await Storage.updateJob(job.id, { outputPath: `/exports/${job.id}.mp4` });
            }

            // 2. Export SRT/ASS
            if (job.formats.includes('srt')) {
                const srtContent = this.generateSRT(project.timeline);
                await fs.writeFile(path.join(outputDir, 'subtitle.srt'), srtContent);
            }

            await Storage.updateJob(job.id, { status: 'completed', progress: 100, completedAt: new Date().toISOString() });
            console.log(`[Job ${job.id}] Completed!`);

        } catch (error: any) {
            console.error(`[Job ${job.id}] Failed:`, error);
            await Storage.updateJob(job.id, { status: 'failed', error: error.message });
        }
    }

    private generateSRT(timeline: any): string {
        let srt = '';
        timeline.segments.forEach((seg: any, i: number) => {
            const start = this.formatSrtTime(seg.startMs);
            const end = this.formatSrtTime(seg.endMs);
            srt += `${i + 1}\n${start} --> ${end}\n${seg.text}\n\n`;
        });
        return srt;
    }

    private formatSrtTime(ms: number): string {
        const date = new Date(ms);
        const hh = String(date.getUTCHours()).padStart(2, '0');
        const mm = String(date.getUTCMinutes()).padStart(2, '0');
        const ss = String(date.getUTCSeconds()).padStart(2, '0');
        const mss = String(date.getUTCMilliseconds()).padStart(3, '0');
        return `${hh}:${mm}:${ss},${mss}`;
    }
}

export const GlobalWorker = new RenderWorker();
