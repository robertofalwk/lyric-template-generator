import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'storage', 'database.sqlite');
const db = new Database(dbPath);

// Create tables
db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        audioOriginalPath TEXT,
        audioProcessedPath TEXT,
        lyricsRaw TEXT,
        lyricsNormalized TEXT,
        selectedTemplateId TEXT,
        selectedBackgroundAssetId TEXT, -- V4 Asset Snap
        selectedPackId TEXT,            -- V4 Pack Snap
        lastVisualScore INTEGER,        -- V4 Scoring
        aspectRatio TEXT,
        status TEXT,
        alignmentStatus TEXT,
        renderStatus TEXT,
        exportFormats TEXT,
        settings TEXT, -- JSON
        latestTimelinePath TEXT,
        timeline TEXT -- JSON
    );

    CREATE TABLE IF NOT EXISTS background_assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- image, video, gradient, generated
        sourceType TEXT NOT NULL, -- uploaded, generated, stock
        localPath TEXT NOT NULL,
        publicPath TEXT NOT NULL,
        prompt TEXT,
        tags TEXT, -- JSON
        metadata TEXT, -- JSON
        dominantColors TEXT, -- JSON
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS style_packs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        config TEXT, -- JSON (linked templates, preferred palettes, fonts)
        category TEXT,
        isPublic INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        data TEXT, -- JSON
        sourceType TEXT DEFAULT 'stock',
        isFavorite INTEGER DEFAULT 0,
        baseTemplateId TEXT,
        createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS template_versions (
        id TEXT PRIMARY KEY,
        templateId TEXT NOT NULL,
        version INTEGER NOT NULL,
        prompt TEXT,
        data TEXT, -- JSON
        parentVersionId TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(templateId) REFERENCES templates(id)
    );

    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        startedAt TEXT,
        finishedAt TEXT,
        outputPath TEXT,
        logs TEXT, -- JSON
        payload TEXT, -- JSON
        errorMessage TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );
`);

// Migration scripts for V4
try { db.exec(`ALTER TABLE projects ADD COLUMN selectedBackgroundAssetId TEXT;`); } catch(e){}
try { db.exec(`ALTER TABLE projects ADD COLUMN selectedPackId TEXT;`); } catch(e){}
try { db.exec(`ALTER TABLE projects ADD COLUMN lastVisualScore INTEGER;`); } catch(e){}

export default db;
