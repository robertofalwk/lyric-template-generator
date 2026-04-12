import { jobRepository } from './repositories/JobRepository';
import { projectRepository } from './repositories/ProjectRepository';
import { alignmentService } from '../domains/alignment/AlignmentService';
import { renderingService } from '../domains/rendering/RenderingService';
import path from 'path';

async function processQueue() {
    console.log('👷 Worker started. Polling for jobs...');

    while (true) {
        try {
            const job = await jobRepository.findNextQueued();

            if (job) {
                console.log(`[Job ${job.id}] Picking up ${job.type} job...`);
                await jobRepository.save({ ...job, status: 'processing', startedAt: new Date().toISOString() });

                const project = await projectRepository.findById(job.projectId);
                if (!project) throw new Error('Project not found');

                if (job.type === 'alignment') {
                    const timelinePath = path.join(process.cwd(), 'storage', 'projects', project.id, 'timeline.json');
                    
                    const timeline = await alignmentService.align(
                        project.audioOriginalPath,
                        project.lyricsRaw,
                        project.settings,
                        timelinePath
                    );

                    await projectRepository.save({
                        ...project,
                        alignmentStatus: 'completed',
                        status: 'ready',
                        timeline
                    });

                    await jobRepository.save({
                        ...job,
                        status: 'completed',
                        progress: 100,
                        finishedAt: new Date().toISOString(),
                        logs: [...job.logs, 'Alignment completed successfully']
                    });

                } else if (job.type === 'render') {
                    const outputPath = await renderingService.render(project, job.id, (progress, log) => {
                        // In-process log update (might be too frequent for SQL, but okay for local)
                        jobRepository.save({ ...job, progress, status: 'processing' });
                    });

                    await jobRepository.save({
                        ...job,
                        status: 'completed',
                        progress: 100,
                        outputPath,
                        finishedAt: new Date().toISOString(),
                        logs: [...job.logs, 'Render completed successfully']
                    });
                }
            }
        } catch (error: any) {
            console.error('Worker Error:', error.message);
            // Handle job failure
            // We'd need the current job ID here
        }

        await new Promise(r => setTimeout(r, 3000));
    }
}

processQueue();
