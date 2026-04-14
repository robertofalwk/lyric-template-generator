import db from '../database/db';
import { ProjectScene, ProjectSceneSchema } from '@/src/schemas';

export class ProjectSceneRepository {
    async findByProjectId(projectId: string): Promise<ProjectScene[]> {
        const rows = db.prepare('SELECT * FROM project_scenes WHERE projectId = ? ORDER BY startMs ASC').all(projectId) as any[];
        return rows.map(row => this.mapRow(row));
    }

    async save(scene: ProjectScene): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO project_scenes (id, projectId, name, startMs, endMs, sectionType, templateId, backgroundAssetId, packId, intensity, transitionIn, transitionOut, visualScore, settings, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            scene.id,
            scene.projectId,
            scene.name,
            scene.startMs,
            scene.endMs,
            scene.sectionType,
            scene.templateId || null,
            scene.backgroundAssetId || null,
            scene.packId || null,
            scene.intensity,
            scene.transitionIn,
            scene.transitionOut,
            scene.visualScore || null,
            JSON.stringify(scene.settings || {}),
            scene.createdAt
        );
    }

    async deleteByProjectId(projectId: string): Promise<void> {
        db.prepare('DELETE FROM project_scenes WHERE projectId = ?').run(projectId);
    }

    async delete(id: string): Promise<void> {
        db.prepare('DELETE FROM project_scenes WHERE id = ?').run(id);
    }

    private mapRow(row: any): ProjectScene {
        return ProjectSceneSchema.parse({
            ...row,
            settings: row.settings ? JSON.parse(row.settings) : {},
        });
    }
}

export const projectSceneRepository = new ProjectSceneRepository();

