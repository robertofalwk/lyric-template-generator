import db from '../database/db';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { settingsRepository } from '../repositories/SettingsRepository';

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
        const dbType = settingsRepository.get('ai_provider');
        const dbKey = settingsRepository.get('openai_api_key');
        
        const hasOpenAI = (dbType === 'openai' && !!dbKey) || (process.env.TEMPLATE_AI_PROVIDER === 'openai' && !!process.env.OPENAI_API_KEY);

        const checks = {
            database: false,
            ffmpeg: false,
            python: false,
            aligner: false,
            openai: hasOpenAI,
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
            
            // Check for Aligner dependency - Attempt real import to verify environment
            try {
                execSync('python -c "import stable_whisper; print(\'ok\')"');
                checks.aligner = true;
            } catch (e) {
                console.warn('[HEALTH_CHECK] stable_whisper import failed via python');
            }
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
                openaiModel: settingsRepository.get('openai_model') || process.env.OPENAI_MODEL || 'gpt-4o'
            }
        };
    }
}
