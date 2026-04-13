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
    data TEXT NOT NULL,
    sourceType TEXT DEFAULT 'manual',
    isFavorite INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft',
    createdAt TEXT
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

// Jobs
db.exec(`
  CREATE TABLE IF NOT EXISTS render_jobs (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    payload TEXT,
    outputPath TEXT,
    createdAt TEXT
  )
`);

console.log('✔ Studio Node Initialized at:', DB_PATH);
db.close();
