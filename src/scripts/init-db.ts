import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'storage');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

console.log('Initializing V7 Studio Database...');

// Projects
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    createdAt TEXT,
    updatedAt TEXT,
    audioOriginalPath TEXT,
    audioProcessedPath TEXT,
    lyricsRaw TEXT,
    lyricsNormalized TEXT,
    selectedTemplateId TEXT,
    aspectRatio TEXT,
    status TEXT DEFAULT 'draft',
    alignmentStatus TEXT DEFAULT 'none',
    renderStatus TEXT DEFAULT 'none',
    exportFormats TEXT,
    settings TEXT,
    latestTimelinePath TEXT,
    timeline TEXT,
    errorMessage TEXT
  )
`);

// Templates
db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    data TEXT NOT NULL,
    sourceType TEXT DEFAULT 'manual',
    isFavorite INTEGER DEFAULT 0,
    baseTemplateId TEXT,
    createdAt TEXT
  )
`);

// Assets
db.exec(`
  CREATE TABLE IF NOT EXISTS background_assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    sourceType TEXT NOT NULL,
    localPath TEXT NOT NULL,
    publicPath TEXT NOT NULL,
    metadata TEXT,
    createdAt TEXT
  )
`);

// Jobs (Reconciled with JobRepository)
db.exec(`
  CREATE TABLE IF NOT EXISTS render_jobs (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    createdAt TEXT,
    startedAt TEXT,
    finishedAt TEXT,
    outputPath TEXT,
    logs TEXT,
    payload TEXT,
    errorMessage TEXT
  )
`);

// Comments (V6 Review)
db.exec(`
  CREATE TABLE IF NOT EXISTS project_comments (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    sceneId TEXT,
    timestampMs INTEGER,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'note',
    status TEXT DEFAULT 'open',
    createdAt TEXT,
    resolvedAt TEXT
  )
`);

// System Settings (V7 Ops)
db.exec(`
  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

console.log('✔ Studio Node Initialized at:', DB_PATH);
db.close();
