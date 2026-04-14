import db from '../database/db';
import { Project, ProjectSchema } from '@/src/schemas';

export class ProjectRepository {
    async findAll(): Promise<Project[]> {
        const stmt = db.prepare('SELECT * FROM projects');
        const rows = stmt.all() as any[];
        return rows.map(this.mapRowToProject);
    }

    async findById(id: string): Promise<Project | null> {
        const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return null;
        return this.mapRowToProject(row);
    }

    async save(project: Project): Promise<void> {
        const validated = ProjectSchema.parse(project);
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO projects (
                id, title, createdAt, updatedAt, audioOriginalPath, 
                audioProcessedPath, lyricsRaw, lyricsNormalized, 
                selectedTemplateId, selectedBackgroundAssetId, selectedPackId,
                lastVisualScore, aspectRatio, status, 
                alignmentStatus, renderStatus, exportFormats, 
                settings, latestTimelinePath, timeline, errorMessage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            validated.id,
            validated.title,
            validated.createdAt,
            validated.updatedAt,
            validated.audioOriginalPath || null,
            validated.audioProcessedPath || null,
            validated.lyricsRaw,
            validated.lyricsNormalized || null,
            validated.selectedTemplateId,
            validated.selectedBackgroundAssetId || null,
            validated.selectedPackId || null,
            validated.lastVisualScore || null,
            validated.aspectRatio,
            validated.status,
            validated.alignmentStatus,
            validated.renderStatus,
            JSON.stringify(validated.exportFormats),
            JSON.stringify(validated.settings),
            validated.latestTimelinePath || null,
            validated.timeline ? JSON.stringify(validated.timeline) : null,
            validated.errorMessage || null
        );
    }

    async updateStatus(id: string, status: Project['status']): Promise<void> {
        const stmt = db.prepare('UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?');
        stmt.run(status, new Date().toISOString(), id);
    }

    private mapRowToProject(row: any): Project {
        return ProjectSchema.parse({
            ...row,
            exportFormats: row.exportFormats ? JSON.parse(row.exportFormats) : [],
            settings: row.settings ? JSON.parse(row.settings) : {},
            timeline: row.timeline ? JSON.parse(row.timeline) : undefined
        });
    }
}

export const projectRepository = new ProjectRepository();
