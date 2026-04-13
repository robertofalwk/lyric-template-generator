import db from '../database/db';
import { BackgroundAsset, BackgroundAssetSchema } from '@/src/schemas';

export class BackgroundAssetRepository {
    async findAll(): Promise<BackgroundAsset[]> {
        const rows = db.prepare('SELECT * FROM background_assets ORDER BY createdAt DESC').all() as any[];
        return rows.map(row => this.mapRow(row));
    }

    async findById(id: string): Promise<BackgroundAsset | null> {
        const row = db.prepare('SELECT * FROM background_assets WHERE id = ?').get(id) as any;
        if (!row) return null;
        return this.mapRow(row);
    }

    async save(asset: BackgroundAsset): Promise<void> {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO background_assets (id, name, type, sourceType, localPath, publicPath, prompt, tags, metadata, dominantColors, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            asset.id,
            asset.name,
            asset.type,
            asset.sourceType,
            asset.localPath,
            asset.publicPath,
            asset.prompt || null,
            JSON.stringify(asset.tags),
            JSON.stringify(asset.metadata),
            JSON.stringify(asset.dominantColors),
            asset.createdAt
        );
    }

    async delete(id: string): Promise<void> {
        db.prepare('DELETE FROM background_assets WHERE id = ?').run(id);
    }

    private mapRow(row: any): BackgroundAsset {
        return BackgroundAssetSchema.parse({
            ...row,
            tags: JSON.parse(row.tags),
            metadata: JSON.parse(row.metadata),
            dominantColors: JSON.parse(row.dominantColors),
        });
    }
}

export const backgroundAssetRepository = new BackgroundAssetRepository();
