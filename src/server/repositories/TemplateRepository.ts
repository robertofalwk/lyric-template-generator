import db from '../database/db';
import { Template, TemplateSchema } from '@/src/schemas';

export class TemplateRepository {
    async findAll(): Promise<Template[]> {
        const stmt = db.prepare('SELECT * FROM templates');
        const rows = stmt.all() as any[];
        return rows.map(row => TemplateSchema.parse(JSON.parse(row.data)));
    }

    async findById(id: string): Promise<Template | null> {
        const stmt = db.prepare('SELECT * FROM templates WHERE id = ?');
        const row = stmt.get(id) as any;
        if (!row) return null;
        return TemplateSchema.parse(JSON.parse(row.data));
    }

    async save(template: Template): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO templates (id, name, category, data, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(
            template.id,
            template.name,
            template.category,
            JSON.stringify(template),
            new Date().toISOString()
        );
    }
}

export const templateRepository = new TemplateRepository();
