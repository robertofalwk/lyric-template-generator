import db from '../database/db';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export interface SystemHealth {
    status: 'ok' | 'degraded' | 'critical';
    checks: {
        database: boolean;
        ffmpeg: boolean;
        python: boolean;
        aligner: boolean;
        openai: boolean;
        storage: boolean;
    };
    details: {
        dbPath: string;
        ffmpegVersion?: string;
        pythonVersion?: string;
        openaiModel: string;
    };
}

export class SystemHealthService {
    static async check(): Promise<SystemHealth> {
        const checks = {
            database: false,
            ffmpeg: false,
            python: false,
            openai: !!process.env.OPENAI_API_KEY,
            storage: false
        };

        // 1. DB Check
        try {
            db.prepare('SELECT 1').get();
            checks.database = true;
        } catch (e) {}

        // 2. FFmpeg Check
        try {
            const version = execSync('ffmpeg -version').toString().split('\n')[0];
            checks.ffmpeg = true;
        } catch (e) {}

        // 3. Python Check
        try {
            execSync('python --version');
            checks.python = true;
            
            // Check for Aligner dependency
            try {
                execSync('pip show stable-ts');
                checks.aligner = true;
            } catch (e) {}
        } catch (e) {}

        // 4. Storage Check
        try {
            const storagePath = path.join(process.cwd(), 'storage');
            await fs.access(storagePath);
            checks.storage = true;
        } catch (e) {}

        const status = Object.values(checks).every(v => v) ? 'ok' : 
                      Object.values(checks).filter(v => v).length > 2 ? 'degraded' : 'critical';

        return {
            status,
            checks,
            details: {
                dbPath: path.join(process.cwd(), 'storage', 'database.sqlite'),
                openaiModel: process.env.OPENAI_MODEL || 'gpt-4o'
            }
        };
    }
}
