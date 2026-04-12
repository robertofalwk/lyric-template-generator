import fs from 'fs/promises';
import path from 'path';
import { RenderJob, RenderJobSchema } from '@/src/schemas';

const JOBS_PATH = path.join(process.cwd(), 'storage', 'jobs.json');

export class JobRepository {
    private async ensureFile() {
        try {
            await fs.access(JOBS_PATH);
        } catch {
            await fs.writeFile(JOBS_PATH, JSON.stringify([]));
        }
    }

    async findAll(): Promise<RenderJob[]> {
        await this.ensureFile();
        const data = await fs.readFile(JOBS_PATH, 'utf-8');
        const raw = JSON.parse(data);
        return raw.map((j: any) => RenderJobSchema.parse(j));
    }

    async findById(id: string): Promise<RenderJob | null> {
        const jobs = await this.findAll();
        return jobs.find(j => j.id === id) || null;
    }

    async save(job: RenderJob): Promise<void> {
        const jobs = await this.findAll();
        const validated = RenderJobSchema.parse(job);
        const index = jobs.findIndex(j => j.id === job.id);
        
        if (index > -1) {
            jobs[index] = validated;
        } else {
            jobs.push(validated);
        }
        
        await fs.writeFile(JOBS_PATH, JSON.stringify(jobs, null, 2));
    }

    async getByProjectId(projectId: string): Promise<RenderJob[]> {
        const jobs = await this.findAll();
        return jobs.filter(j => j.projectId === projectId);
    }
}

export const jobRepository = new JobRepository();
