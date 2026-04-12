import db from '../database/db';
import { RenderJob, RenderJobSchema } from '@/src/schemas';

export class JobRepository {
    async findAll(): Promise<RenderJob[]> {
        const stmt = db.prepare('SELECT * FROM jobs');
        const rows = stmt.all() as any[];
        return rows.map(this.mapRowToJob);
    }

    async findById(id: string): Promise<RenderJob | null> {
        const stmt = db.prepare('SELECT * FROM jobs WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return null;
        return this.mapRowToJob(row);
    }

    async save(job: RenderJob): Promise<void> {
        const validated = RenderJobSchema.parse(job);
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO jobs (
                id, projectId, type, status, progress, 
                createdAt, startedAt, finishedAt, 
                outputPath, logs, errorMessage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            validated.id,
            validated.projectId,
            validated.type,
            validated.status,
            validated.progress,
            validated.createdAt,
            validated.startedAt || null,
            validated.finishedAt || null,
            validated.outputPath || null,
            JSON.stringify(validated.logs),
            validated.errorMessage || null
        );
    }

    async getByProjectId(projectId: string): Promise<RenderJob[]> {
        const stmt = db.prepare('SELECT * FROM jobs WHERE projectId = ?');
        const rows = stmt.all(projectId) as any[];
        return rows.map(this.mapRowToJob);
    }

    async findNextQueued(): Promise<RenderJob | null> {
        const stmt = db.prepare('SELECT * FROM jobs WHERE status = "queued" LIMIT 1');
        const row = stmt.get() as any;
        if (!row) return null;
        return this.mapRowToJob(row);
    }

    private mapRowToJob(row: any): RenderJob {
        return RenderJobSchema.parse({
            ...row,
            logs: JSON.parse(row.logs)
        });
    }
}

export const jobRepository = new JobRepository();
