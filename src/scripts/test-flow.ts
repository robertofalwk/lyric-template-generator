import { projectRepository } from '../server/repositories/ProjectRepository';
import { jobRepository } from '../server/repositories/JobRepository';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';

async function runTest() {
    console.log('--- OPERATIONAL VALIDATION START ---');

    const projectId = uuid();
    const now = new Date().toISOString();

    // 1. Create Project
    console.log('[1/4] Creating Test Project...');
    await projectRepository.save({
        id: projectId,
        title: 'Stabilization Test',
        createdAt: now,
        updatedAt: now,
        status: 'draft',
        aspectRatio: '9:16',
        alignmentStatus: 'none',
        renderStatus: 'none',
        settings: { language: 'en', useVocalIsolation: false, wordLevelTiming: true },
        exportFormats: []
    } as any);

    // 2. Simulate Audio Upload
    console.log('[2/4] Simulating Audio Signal...');
    const storageDir = path.join(process.cwd(), 'storage', 'projects', projectId);
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
    
    // We expect a real file for ffmpeg or aligner usually, but here we just test the DB flow
    const audioPath = path.join(storageDir, 'audio.mp3');
    fs.writeFileSync(audioPath, 'fake-audio-content'); 

    const project = await projectRepository.findById(projectId);
    if (!project) throw new Error('Failed to create project');
    
    await projectRepository.save({
        ...project,
        audioOriginalPath: audioPath,
        lyricsRaw: 'Test lyrics for alignment stabilization.'
    });

    // 3. Queue Job
    console.log('[3/4] Queuing Alignment Job...');
    const jobId = uuid();
    await jobRepository.save({
        id: jobId,
        projectId,
        type: 'alignment',
        status: 'queued',
        progress: 0,
        createdAt: now,
        logs: []
    } as any);

    console.log(`[4/4] Validation Setup Complete. Job ID: ${jobId}`);
    console.log('--- Ready for Worker Execution ---');
}

runTest().catch(console.error);
