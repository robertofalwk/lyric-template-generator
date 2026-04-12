import fs from 'fs/promises';
import path from 'path';
import { Project, ProjectSchema } from '@/src/schemas';

const PROJECTS_PATH = path.join(process.cwd(), 'storage', 'projects.json');

export class ProjectRepository {
    private async ensureFile() {
        try {
            await fs.access(PROJECTS_PATH);
        } catch {
            await fs.writeFile(PROJECTS_PATH, JSON.stringify([]));
        }
    }

    async findAll(): Promise<Project[]> {
        await this.ensureFile();
        const data = await fs.readFile(PROJECTS_PATH, 'utf-8');
        const raw = JSON.parse(data);
        return raw.map((p: any) => ProjectSchema.parse(p));
    }

    async findById(id: string): Promise<Project | null> {
        const projects = await this.findAll();
        return projects.find(p => p.id === id) || null;
    }

    async save(project: Project): Promise<void> {
        const projects = await this.findAll();
        const validated = ProjectSchema.parse(project);
        const index = projects.findIndex(p => p.id === project.id);
        
        if (index > -1) {
            projects[index] = validated;
        } else {
            projects.push(validated);
        }
        
        await fs.writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2));
    }
}

export const projectRepository = new ProjectRepository();
