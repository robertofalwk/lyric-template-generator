import db from '../database/db';
import { Template, TemplateSchema } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';

export class TemplateRepository {
    async findAll(filter?: { sourceType?: string, isFavorite?: boolean }): Promise<Template[]> {
        let query = 'SELECT * FROM templates WHERE 1=1';
        const params: any[] = [];

        if (filter?.sourceType) {
            query += ' AND sourceType = ?';
            params.push(filter.sourceType);
        }
        if (filter?.isFavorite) {
            query += ' AND isFavorite = 1';
        }

        const stmt = db.prepare(query);
        const rows = stmt.all(...params) as any[];
        return rows.map(row => TemplateSchema.parse(JSON.parse(row.data)));
    }

    async findById(id: string): Promise<Template | null> {
        const stmt = db.prepare('SELECT * FROM templates WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return null;
        return TemplateSchema.parse(JSON.parse(row.data));
    }

    /**
     * Saves a template. 
     * @param options.createVersion If true, snapshots the state into template_versions.
     */
    async save(template: Template, options: { createVersion?: boolean } = {}): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO templates (id, name, category, data, sourceType, isFavorite, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            template.id,
            template.name,
            template.category,
            JSON.stringify(template),
            template.metadata?.sourceType || 'manual',
            template.metadata?.isFavorite ? 1 : 0,
            template.id.startsWith('draft_') ? new Date().toISOString() : (template.id ? undefined : new Date().toISOString()) // rudimentary logic
        );

        if (options.createVersion) {
            const versionStmt = db.prepare(`
                INSERT INTO template_versions (id, templateId, version, prompt, data, createdAt)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            versionStmt.run(
                uuidv4(),
                template.id,
                template.metadata?.version || 1,
                template.metadata?.originalPrompt || 'Snapshot',
                JSON.stringify(template),
                new Date().toISOString()
            );
        }
    }

    async restoreVersion(templateId: string, versionId: string): Promise<Template> {
        const stmt = db.prepare('SELECT data FROM template_versions WHERE id = ? AND templateId = ?');
        const row = stmt.get(versionId, templateId) as any;
        if (!row) throw new Error('Version not found');

        const restoredData = TemplateSchema.parse(JSON.parse(row.data));
        // Update main template record to this state
        await this.save(restoredData, { createVersion: false });
        return restoredData;
    }

    async setFavorite(id: string, isFavorite: boolean): Promise<void> {
        const template = await this.findById(id);
        if (template) {
            template.metadata = { ...template.metadata, isFavorite };
            await this.save(template, { createVersion: false });
        }
    }

    async delete(id: string): Promise<void> {
        db.prepare('DELETE FROM template_versions WHERE templateId = ?').run(id);
        db.prepare('DELETE FROM templates WHERE id = ?').run(id);
    }

    async getHistory(id: string): Promise<any[]> {
        const stmt = db.prepare('SELECT id, version, prompt, createdAt FROM template_versions WHERE templateId = ? ORDER BY version DESC, createdAt DESC');
        return stmt.all(id);
    }
}

export const templateRepository = new TemplateRepository();
