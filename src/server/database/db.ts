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
        aspectRatio TEXT,
        status TEXT,
        alignmentStatus TEXT,
        renderStatus TEXT,
        exportFormats TEXT,
        settings TEXT, -- JSON
        latestTimelinePath TEXT,
        timeline TEXT -- JSON
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
        logs TEXT, -- JSON array
        payload TEXT, -- JSON object
        errorMessage TEXT,
        FOREIGN KEY(projectId) REFERENCES projects(id)
    );

    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        data TEXT, -- JSON
        createdAt TEXT NOT NULL
    );
`);

export default db;
