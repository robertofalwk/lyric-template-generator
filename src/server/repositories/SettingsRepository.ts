import db from '../database/db';

export class SettingsRepository {
    get(key: string): string | null {
        try {
            const stmt = db.prepare('SELECT value FROM system_settings WHERE key = ?');
            const row = stmt.get(key) as any;
            return row ? row.value : null;
        } catch (e) {
            return null;
        }
    }

    set(key: string, value: string): void {
        const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value) VALUES (?, ?)');
        stmt.run(key, value);
    }

    getAll(): Record<string, string> {
        try {
            const stmt = db.prepare('SELECT * FROM system_settings');
            const rows = stmt.all() as any[];
            const settings: Record<string, string> = {};
            rows.forEach(r => {
                settings[r.key] = r.value;
            });
            return settings;
        } catch (e) {
            return {};
        }
    }
}

export const settingsRepository = new SettingsRepository();
