import db from '../database/db';
import { StylePack, StylePackSchema } from '@/src/schemas';

export class StylePackRepository {
    async findAll(): Promise<StylePack[]> {
        const rows = db.prepare('SELECT * FROM style_packs ORDER BY createdAt DESC').all() as any[];
        return rows.map(row => this.mapRow(row));
    }

    async findById(id: string): Promise<StylePack | null> {
        const row = db.prepare('SELECT * FROM style_packs WHERE id = ?').get(id) as any;
        if (!row) return null;
        return this.mapRow(row);
    }

    async save(pack: StylePack): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO style_packs (id, name, description, config, category, isPublic, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            pack.id,
            pack.name,
            pack.description || null,
            JSON.stringify(pack.config),
            pack.category,
            pack.isPublic ? 1 : 0,
            pack.createdAt
        );
    }

    private mapRow(row: any): StylePack {
        return StylePackSchema.parse({
            ...row,
            config: JSON.parse(row.config),
            isPublic: !!row.isPublic
        });
    }
}

export const stylePackRepository = new StylePackRepository();
