import db from '../database/db';
import { ProjectComment, ProjectCommentSchema } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';

export class ProjectCommentRepository {
    async findByProjectId(projectId: string): Promise<ProjectComment[]> {
        const stmt = db.prepare('SELECT * FROM project_comments WHERE projectId = ? ORDER BY createdAt DESC');
        const rows = stmt.all(projectId) as any[];
        return rows.map(row => ProjectCommentSchema.parse(row));
    }

    async save(comment: Partial<ProjectComment> & { projectId: string; message: string }): Promise<ProjectComment> {
        const fullComment: ProjectComment = {
            id: comment.id || uuidv4(),
            projectId: comment.projectId,
            sceneId: comment.sceneId ?? null,
            timestampMs: comment.timestampMs ?? null,
            message: comment.message,
            type: comment.type || 'note',
            status: comment.status || 'open',
            createdAt: comment.createdAt || new Date().toISOString(),
            resolvedAt: comment.resolvedAt ?? null,
        };

        const validated = ProjectCommentSchema.parse(fullComment);
        
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO project_comments (
                id, projectId, sceneId, timestampMs, message, type, status, createdAt, resolvedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            validated.id,
            validated.projectId,
            validated.sceneId,
            validated.timestampMs,
            validated.message,
            validated.type,
            validated.status,
            validated.createdAt,
            validated.resolvedAt || null
        );

        return validated;
    }

    async delete(id: string): Promise<void> {
        db.prepare('DELETE FROM project_comments WHERE id = ?').run(id);
    }
}

export const projectCommentRepository = new ProjectCommentRepository();
