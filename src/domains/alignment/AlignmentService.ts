import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { Timeline, ProjectSettings, TimelineSchema } from '@/src/schemas';

const execPromise = promisify(exec);

export class AlignmentService {
    async align(audioPath: string, lyrics: string, settings: ProjectSettings, outputPath: string): Promise<Timeline> {
        const workerPath = path.join(process.cwd(), 'worker', 'aligner.py');
        const lyricsPath = path.join(path.dirname(outputPath), 'lyrics_temp.txt');
        
        await fs.writeFile(lyricsPath, lyrics);

        const isolateFlag = settings.useVocalIsolation ? '--isolate' : '';
        const langFlag = `--language ${settings.language}`;
        const wordLevelFlag = settings.wordLevelTiming ? '--wordlevel' : '';

        try {
            const command = `python "${workerPath}" --audio "${audioPath}" --lyrics "${lyricsPath}" --output "${outputPath}" ${isolateFlag} ${langFlag} ${wordLevelFlag}`;
            console.log(`[Alignment] Running: ${command}`);
            
            await execPromise(command);
            
            const data = await fs.readFile(outputPath, 'utf-8');
            const timeline = JSON.parse(data);
            
            // Cleanup temp lyrics
            await fs.unlink(lyricsPath);
            
            return TimelineSchema.parse(timeline);
        } catch (error: any) {
            console.error('[Alignment] Error:', error.stderr || error.message);
            throw new Error(`Alignment failed: ${error.stderr || error.message}`);
        }
    }
}

export const alignmentService = new AlignmentService();
