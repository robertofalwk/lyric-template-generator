import { jobRepository } from '@/src/server/repositories/JobRepository';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { RenderJob, Project } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';
import { renderingService } from '../rendering/RenderingService';

export class JobManager {
    private isLooping = false;

    async createJob(projectId: string, formats: string[]): Promise<RenderJob> {
        const job: RenderJob = {
            id: uuidv4(),
            projectId,
            status: 'queued',
            progress: 0,
            createdAt: new Date().toISOString(),
            logs: [`Job created for project ${projectId}`],
        };
        await jobRepository.save(job);
        this.startWorker();
        return job;
    }

    startWorker() {
        if (this.isLooping) return;
        this.isLooping = true;
        this.workerLoop();
    }

    private async workerLoop() {
        console.log('[JobManager] Worker loop started');
        while (this.isLooping) {
            try {
                const jobs = await jobRepository.findAll();
                const nextJob = jobs.find(j => j.status === 'queued');

                if (nextJob) {
                    await this.processJob(nextJob);
                } else {
                    // Stop loop if no jobs
                    this.isLooping = false;
                }
            } catch (err) {
                console.error('[JobManager] Loop error:', err);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    private async processJob(job: RenderJob) {
        try {
            await this.updateJob(job.id, { status: 'processing', startedAt: new Date().toISOString() });
            
            const project = await projectRepository.findById(job.projectId);
            if (!project) throw new Error('Project not found');

            await renderingService.render(project, job.id, (progress, log) => {
                this.updateJob(job.id, { 
                    progress, 
                    logs: [...(job.logs || []), log] 
                });
            });

            await this.updateJob(job.id, { 
                status: 'completed', 
                progress: 100, 
                finishedAt: new Date().toISOString() 
            });

        } catch (error: any) {
            console.error(`[JobManager] Job ${job.id} failed:`, error);
            await this.updateJob(job.id, { 
                status: 'failed', 
                errorMessage: error.message 
            });
        }
    }

    private async updateJob(id: string, updates: Partial<RenderJob>) {
        const job = await jobRepository.findById(id);
        if (job) {
            await jobRepository.save({ ...job, ...updates });
        }
    }
}

export const jobManager = new JobManager();
