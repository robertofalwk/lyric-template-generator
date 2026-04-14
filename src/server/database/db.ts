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
        selectedBackgroundAssetId TEXT,
        selectedPackId TEXT,
        lastVisualScore INTEGER,
        aspectRatio TEXT,
        status TEXT DEFAULT 'draft', -- draft, review, approved, rendering, completed, published
        alignmentStatus TEXT,
        renderStatus TEXT,
        exportFormats TEXT,
        settings TEXT, -- JSON
        latestTimelinePath TEXT,
        timeline TEXT, -- JSON
        errorMessage TEXT
    );

    CREATE TABLE IF NOT EXISTS project_scenes (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        name TEXT NOT NULL,
        startMs INTEGER NOT NULL,
        endMs INTEGER NOT NULL,
        sectionType TEXT DEFAULT 'verse',
        templateId TEXT,
        backgroundAssetId TEXT,
        packId TEXT,
        intensity TEXT DEFAULT 'medium',
        settings TEXT, -- JSON
        transitionIn TEXT DEFAULT 'fade',
        transitionOut TEXT DEFAULT 'fade',
        visualScore INTEGER,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );

    -- V6 Operations: Comments
    CREATE TABLE IF NOT EXISTS project_comments (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        sceneId TEXT,
        timestampMs INTEGER,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'note', -- note, issue, approval, warning
        status TEXT DEFAULT 'open', -- open, resolved
        createdAt TEXT NOT NULL,
        resolvedAt TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );

    -- V6 Operations: Render History & Snapshots
    CREATE TABLE IF NOT EXISTS render_history (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        jobId TEXT,
        presetId TEXT,
        snapshot TEXT NOT NULL, -- JSON (Frozen Template + Scenes + Assets)
        outputPath TEXT,
        posterPath TEXT,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );

    -- V6 Operations: Event Timeline
    CREATE TABLE IF NOT EXISTS project_events (
        id TEXT PRIMARY KEY,
        projectId TEXT NOT NULL,
        type TEXT NOT NULL, -- created, aligned, scene_added, approved, rendered, published
        payload TEXT, -- JSON
        createdAt TEXT NOT NULL,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS background_assets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        sourceType TEXT NOT NULL,
        localPath TEXT NOT NULL,
        publicPath TEXT NOT NULL,
        thumbnailPath TEXT,
        proxyPath TEXT,
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
        config TEXT, -- JSON
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

    CREATE TABLE IF NOT EXISTS render_jobs (
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

    CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
`);

// Migration scripts for V6
try { db.exec(`CREATE TABLE IF NOT EXISTS project_comments (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, message TEXT NOT NULL, createdAt TEXT NOT NULL);`); } catch(e){}
try { db.exec(`CREATE TABLE IF NOT EXISTS render_history (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, snapshot TEXT NOT NULL, createdAt TEXT NOT NULL);`); } catch(e){}
try { db.exec(`CREATE TABLE IF NOT EXISTS project_events (id TEXT PRIMARY KEY, projectId TEXT NOT NULL, type TEXT NOT NULL, createdAt TEXT NOT NULL);`); } catch(e){}

export default db;
