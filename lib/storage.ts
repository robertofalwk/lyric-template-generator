import fs from 'fs/promises';
import path from 'path';
import { Project, ExportJob } from '@/types';

const STORAGE_ROOT = path.join(process.cwd(), 'storage');
const PROJECTS_FILE = path.join(STORAGE_ROOT, 'projects.json');
const JOBS_FILE = path.join(STORAGE_ROOT, 'jobs.json');

async function ensureFile(file: string, defaultValue: unknown[] = []) {
    try {
        await fs.access(file);
    } catch {
        await fs.writeFile(file, JSON.stringify(defaultValue));
    }
}

export const Storage = {
    async getProjects(): Promise<Project[]> {
        await ensureFile(PROJECTS_FILE);
        const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
        return JSON.parse(data);
    },

    async saveProject(project: Project) {
        const projects = await this.getProjects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index > -1) projects[index] = project;
        else projects.push(project);
        await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    },

    async getProject(id: string): Promise<Project | undefined> {
        const projects = await this.getProjects();
        return projects.find(p => p.id === id);
    },

    async getJobs(): Promise<ExportJob[]> {
        await ensureFile(JOBS_FILE);
        const data = await fs.readFile(JOBS_FILE, 'utf-8');
        return JSON.parse(data);
    },

    async saveJob(job: ExportJob) {
        const jobs = await this.getJobs();
        const index = jobs.findIndex(j => j.id === job.id);
        if (index > -1) jobs[index] = job;
        else jobs.push(job);
        await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
    },

    async updateJob(id: string, updates: Partial<ExportJob>) {
        const jobs = await this.getJobs();
        const index = jobs.findIndex(j => j.id === id);
        if (index > -1) {
            jobs[index] = { ...jobs[index], ...updates };
            await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2));
        }
    }
};
