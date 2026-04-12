import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@/lib/storage';
import { Project, Timeline } from '@/types';
import { STOCK_TEMPLATES } from '@/config/templates';

const execPromise = promisify(exec);

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_MIME = ['audio/mpeg', 'audio/wav', 'audio/mp3'];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File;
        const lyrics = formData.get('lyrics') as string;
        const settingsRaw = formData.get('settings') as string;
        
        const settings = settingsRaw ? JSON.parse(settingsRaw) : {
            useVocalIsolation: false,
            language: 'pt',
            wordLevelTiming: true,
            globalOffsetMs: 0
        };

        if (!audioFile || !lyrics) {
            return NextResponse.json({ error: 'Missing audio or lyrics' }, { status: 400 });
        }

        if (audioFile.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 });
        }

        const projectId = uuidv4();
        const storageRoot = join(process.cwd(), 'storage');
        const projectDir = join(storageRoot, 'projects', projectId);
        await mkdir(projectDir, { recursive: true });

        // Save audio to private storage
        const audioPath = join(projectDir, 'audio.mp3');
        const buffer = Buffer.from(await audioFile.arrayBuffer());
        await writeFile(audioPath, buffer);

        // Save lyrics
        const lyricsPath = join(projectDir, 'lyrics.txt');
        await writeFile(lyricsPath, lyrics);

        const timelinePath = join(projectDir, 'timeline.json');
        
        // Execute Python
        const workerPath = join(process.cwd(), 'worker', 'aligner.py');
        const isolateFlag = settings.useVocalIsolation ? '--isolate' : '';
        const langFlag = `--language ${settings.language}`;
        
        try {
            console.log(`[${projectId}] Starting alignment...`);
            await execPromise(`python "${workerPath}" --audio "${audioPath}" --lyrics "${lyricsPath}" --output "${timelinePath}" ${isolateFlag} ${langFlag}`);
            
            const fs = require('fs');
            const timeline: Timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));

            const project: Project = {
                id: projectId,
                title: audioFile.name.replace(/\.[^/.]+$/, ""),
                audioPath, // In local mode, absolute path is fine for the app
                lyrics,
                timeline,
                template: STOCK_TEMPLATES[0],
                settings,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await Storage.saveProject(project);

            return NextResponse.json(project);
        } catch (error: any) {
            console.error('Python Error:', error.stderr || error.message);
            return NextResponse.json({ error: 'Alignment failed', details: error.stderr }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
