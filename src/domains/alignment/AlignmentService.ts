import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { Timeline, ProjectSettings, TimelineSchema } from '@/src/schemas';

export class AlignmentService {
    async align(
        audioPath: string, 
        lyrics: string, 
        settings: ProjectSettings, 
        outputPath: string,
        onLog?: (log: string) => void
    ): Promise<Timeline> {
        const workerPath = path.join(process.cwd(), 'worker', 'aligner.py');
        const lyricsPath = path.join(path.dirname(outputPath), 'lyrics_temp.txt');
        
        await fs.writeFile(lyricsPath, lyrics);

        const args = [
            workerPath,
            '--audio', audioPath,
            '--lyrics', lyricsPath,
            '--output', outputPath,
            '--language', settings.language,
        ];

        if (settings.useVocalIsolation) args.push('--isolate');
        if (settings.wordLevelTiming) args.push('--wordlevel');

        return new Promise((resolve, reject) => {
            console.log(`[Alignment] Spawning: python ${args.join(' ')}`);
            const child = spawn('python', args);

            let lastOutput = '';

            child.stdout.on('data', (data) => {
                const msg = data.toString().trim();
                console.log(`[Python STDOUT] ${msg}`);
                if (onLog) onLog(msg);
            });

            child.stderr.on('data', (data) => {
                const msg = data.toString().trim();
                console.warn(`[Python STDERR] ${msg}`);
                lastOutput = msg;
            });

            child.on('close', async (code) => {
                try {
                    await fs.unlink(lyricsPath).catch(() => {});
                    
                    if (code !== 0) {
                        return reject(new Error(`Python aligner failed with code ${code}. ${lastOutput}`));
                    }

                    const data = await fs.readFile(outputPath, 'utf-8');
                    const timeline = JSON.parse(data);
                    resolve(TimelineSchema.parse(timeline));
                } catch (err: any) {
                    reject(new Error(`Failed to parse alignment output: ${err.message}`));
                }
            });

            child.on('error', (err) => {
                reject(new Error(`Failed to start Python process: ${err.message}`));
            });
        });
    }
}

export const alignmentService = new AlignmentService();
