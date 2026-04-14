import { jobRepository } from './repositories/JobRepository';
import { projectRepository } from './repositories/ProjectRepository';
import { alignmentService } from '../domains/alignment/AlignmentService';
import { renderingService } from '../domains/rendering/RenderingService';
import path from 'path';

async function processQueue() {
    console.log('👷 Worker started. Polling for jobs...');

    while (true) {
        let currentJob = null;
        try {
            currentJob = await jobRepository.findNextQueued();

            if (currentJob) {
                console.log(`[Job ${currentJob.id}] Picking up ${currentJob.type} job...`);
                
                // Mark as processing
                currentJob.status = 'processing';
                currentJob.startedAt = new Date().toISOString();
                currentJob.logs = [...currentJob.logs, `Started processing ${currentJob.type} at ${currentJob.startedAt}`];
                await jobRepository.save(currentJob);

                const project = await projectRepository.findById(currentJob.projectId);
                if (!project) throw new Error('Project not found');

                if (currentJob.type === 'alignment') {
                    const timelinePath = path.join(process.cwd(), 'storage', 'projects', project.id, 'timeline.json');
                    
                    const timeline = await alignmentService.align(
                        project.audioOriginalPath,
                        project.lyricsRaw,
                        project.settings,
                        timelinePath,
                        (log) => {
                            // Optional: Update logs every few seconds or per segment
                            // For SQLite local, we'll keep it simple
                        }
                    );

                    await projectRepository.save({
                        ...project,
                        alignmentStatus: 'completed',
                        status: 'ready',
                        timeline
                    });

                    await jobRepository.save({
                        ...currentJob,
                        status: 'completed',
                        progress: 100,
                        finishedAt: new Date().toISOString(),
                        logs: [...currentJob.logs, 'Alignment completed successfully']
                    });

                } else if (currentJob.type === 'render') {
                    const customTemplate = currentJob.payload?.customTemplate;
                    const outputPath = await renderingService.render(project, currentJob.id, customTemplate, async (progress, log) => {
                        if (currentJob) {
                            // Update progress periodically
                            currentJob.progress = progress;
                            if (log) currentJob.logs = [...currentJob.logs, log];
                            await jobRepository.save(currentJob);
                        }
                    });

                    await projectRepository.save({
                        ...project,
                        renderStatus: 'completed'
                    });

                    await jobRepository.save({
                        ...currentJob,
                        status: 'completed',
                        progress: 100,
                        outputPath,
                        finishedAt: new Date().toISOString(),
                        logs: [...currentJob.logs, 'Render completed successfully']
                    });
                }
                
                console.log(`[Job ${currentJob.id}] Status: COMPLETED`);
            }
        } catch (error: any) {
            console.error(`[Worker Error] ${error.message}`);
            if (currentJob) {
                await jobRepository.save({
                    ...currentJob,
                    status: 'failed',
                    errorMessage: error.message,
                    finishedAt: new Date().toISOString(),
                    logs: [...currentJob.logs, `Error: ${error.message}`]
                });

                // Also update project to failed state
                const project = await projectRepository.findById(currentJob.projectId);
                if (project) {
                    if (currentJob.type === 'alignment') {
                        await projectRepository.save({ 
                            ...project, 
                            alignmentStatus: 'failed', 
                            status: 'failed',
                            errorMessage: error.message
                        });
                    } else {
                        await projectRepository.save({ 
                            ...project, 
                            renderStatus: 'failed',
                            errorMessage: error.message
                        });
                    }
                }
            }
        }

        await new Promise(r => setTimeout(r, 2000));
    }
}

processQueue().catch(err => {
    console.error('Fatal Worker Loop Error:', err);
});
