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
            currentJob = await jobRepository.claimNextQueued();

            if (currentJob) {
                console.log(`[Job ${currentJob.id}] Claimed ${currentJob.type} job...`);
                
                // StartedAt is already set by claimNextQueued, but we update logs
                currentJob.logs = [...currentJob.logs, `Claimed and started processing ${currentJob.type} at ${new Date().toISOString()}`];
                await jobRepository.save(currentJob);

                const project = await projectRepository.findById(currentJob.projectId);
                if (!project) throw new Error('Project not found');

                if (currentJob.type === 'alignment') {
                    if (!project.audioOriginalPath) throw new Error('Original audio path missing');

                    const timelinePath = path.join(process.cwd(), 'storage', 'projects', project.id, 'timeline.json');
                    
                    const timeline = await alignmentService.align(
                        project.audioOriginalPath,
                        project.lyricsRaw || '',
                        project.settings as any,
                        timelinePath,
                        (log) => {
                            // Progress logs
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
                    const customTemplate = currentJob.payload?.customTemplate as any;
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
