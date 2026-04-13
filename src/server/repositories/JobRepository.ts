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
        const job = {
            ...row,
            logs: JSON.parse(row.logs),
            payload: row.payload ? JSON.parse(row.payload) : undefined
        };
        return RenderJobSchema.parse(job);
    }

    async save(job: RenderJob): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO jobs (id, projectId, type, status, progress, createdAt, startedAt, finishedAt, outputPath, logs, payload, errorMessage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            job.id,
            job.projectId,
            job.type,
            job.status,
            job.progress,
            job.createdAt,
            job.startedAt || null,
            job.finishedAt || null,
            job.outputPath || null,
            JSON.stringify(job.logs),
            job.payload ? JSON.stringify(job.payload) : null,
            job.errorMessage || null
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
