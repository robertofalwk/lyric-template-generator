import db from '../database/db';
import { RenderHistory, RenderHistorySchema } from '@/src/schemas';

export class RenderHistoryRepository {
    async findByProjectId(projectId: string): Promise<RenderHistory[]> {
        const rows = db.prepare('SELECT * FROM render_history WHERE projectId = ? ORDER BY createdAt DESC').all(projectId) as any[];
        return rows.map(row => this.mapRow(row));
    }

    async save(history: RenderHistory): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO render_history (id, projectId, jobId, presetId, snapshot, outputPath, posterPath, status, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            history.id,
            history.projectId,
            history.jobId || null,
            history.presetId || null,
            history.snapshot, // Expecting pre-stringified JSON
            history.outputPath || null,
            history.posterPath || null,
            history.status,
            history.createdAt
        );
    }

    async findById(id: string): Promise<RenderHistory | null> {
        const row = db.prepare('SELECT * FROM render_history WHERE id = ?').get(id) as any;
        if (!row) return null;
        return this.mapRow(row);
    }

    private mapRow(row: any): RenderHistory {
        return RenderHistorySchema.parse(row);
    }
}

export const renderHistoryRepository = new RenderHistoryRepository();
