import db from '../database/db';
import { Template, TemplateSchema } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';

export interface SaveOptions {
    createVersion?: boolean;
    parentVersionId?: string;
    prompt?: string;
}

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

    async save(template: Template, options: SaveOptions = {}): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO templates (id, name, category, data, sourceType, isFavorite, baseTemplateId, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            template.id,
            template.name,
            template.category,
            JSON.stringify(template),
            template.metadata?.sourceType || 'manual',
            template.metadata?.isFavorite ? 1 : 0,
            template.metadata?.baseTemplateId || null,
            new Date().toISOString()
        );

        if (options.createVersion) {
            const versionStmt = db.prepare(`
                INSERT INTO template_versions (id, templateId, version, prompt, data, parentVersionId, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            versionStmt.run(
                uuidv4(),
                template.id,
                template.metadata?.version || 1,
                options.prompt || template.metadata?.originalPrompt || 'Manual Snapshot',
                JSON.stringify(template),
                options.parentVersionId || null,
                new Date().toISOString()
            );
        }
    }

    async duplicate(id: string, newName?: string): Promise<Template> {
        const original = await this.findById(id);
        if (!original) throw new Error('Template not found');

        const duplicated: Template = {
            ...original,
            id: `tpl_${uuidv4().slice(0, 8)}`,
            name: newName || `${original.name} (Copy)`,
            metadata: {
                ...original.metadata,
                version: 1,
                baseTemplateId: original.id, // Set lineage
                isFavorite: false
            }
        };

        await this.save(duplicated, { createVersion: true, prompt: 'Duplicated from ' + original.name });
        return duplicated;
    }

    async restoreVersion(templateId: string, versionId: string): Promise<Template> {
        const stmt = db.prepare('SELECT data FROM template_versions WHERE id = ? AND templateId = ?');
        const row = stmt.get(versionId, templateId) as any;
        if (!row) throw new Error('Version not found');

        const restoredData = TemplateSchema.parse(JSON.parse(row.data));
        // Update version counter and save
        const current = await this.findById(templateId);
        restoredData.metadata.version = (current?.metadata?.version || 0) + 1;
        
        await this.save(restoredData, { 
            createVersion: true, 
            prompt: `Restored from version ${versionId}`,
            parentVersionId: versionId 
        });
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
