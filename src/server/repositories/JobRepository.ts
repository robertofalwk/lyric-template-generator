import db from '../database/db';
import { RenderJob, RenderJobSchema } from '@/src/schemas';

export class JobRepository {
    async findAll(): Promise<RenderJob[]> {
        const stmt = db.prepare('SELECT * FROM render_jobs');
        const rows = stmt.all() as any[];
        return rows.map(this.mapRowToJob);
    }

    async findById(id: string): Promise<RenderJob | null> {
        const stmt = db.prepare('SELECT * FROM render_jobs WHERE id = ?');
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
            INSERT OR REPLACE INTO render_jobs (id, projectId, type, status, progress, createdAt, startedAt, finishedAt, outputPath, logs, payload, errorMessage)
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
        const stmt = db.prepare('SELECT * FROM render_jobs WHERE projectId = ?');
        const rows = stmt.all(projectId) as any[];
        return rows.map(this.mapRowToJob);
    }

    async claimNextQueued(): Promise<RenderJob | null> {
        const row = db.transaction(() => {
            const next = db.prepare("SELECT * FROM render_jobs WHERE status = 'queued' LIMIT 1").get() as any;
            if (!next) return null;
            
            db.prepare("UPDATE render_jobs SET status = 'processing', startedAt = ? WHERE id = ?")
              .run(new Date().toISOString(), next.id);
            
            return next;
        })();

        if (!row) return null;
        // The object returned from transaction still has status = 'queued' from the select
        return this.mapRowToJob({ ...row, status: 'processing' });
    }

    private mapRowToJob(row: any): RenderJob {
        return RenderJobSchema.parse({
            ...row,
            logs: row.logs ? JSON.parse(row.logs) : [],
            payload: row.payload ? JSON.parse(row.payload) : undefined
        });
    }
}

export const jobRepository = new JobRepository();
