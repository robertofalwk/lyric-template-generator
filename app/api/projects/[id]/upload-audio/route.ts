import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const probe = promisify(ffmpeg.ffprobe);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIMES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/aac'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const formData = await req.formData();
        const file = formData.get('audio') as File;
        if (!file) return NextResponse.json({ error: 'No audio file' }, { status: 400 });

        // Basic validation
        if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
        if (!ALLOWED_MIMES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });

        const projectDir = path.join(process.cwd(), 'storage', 'projects', id);
        await mkdir(projectDir, { recursive: true });

        const ext = path.extname(file.name) || '.mp3';
        const audioPath = path.join(projectDir, `audio_source${ext}`);
        
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(audioPath, buffer);

        // Metadata validation via ffprobe
        try {
            const metadata = await probe(audioPath) as any;
            const duration = metadata.format.duration;
            if (duration > 600) { // 10 mins max
                return NextResponse.json({ error: 'Audio Signal too long (max 10 mins)' }, { status: 400 });
            }
        } catch (err: any) {
            console.error('[FFPROBE_ERROR]', err);
            const isMissing = err.message.includes('spawn') || err.message.includes('not found') || err.message.includes('ENOENT');
            return NextResponse.json({ 
                error: isMissing 
                    ? 'System Error: FFmpeg/ffprobe is not installed on the server. Please check environment dependencies.' 
                    : `Audio Validation Failure: ${err.message}`
            }, { status: isMissing ? 500 : 400 });
        }

        const updatedProject = {
            ...project,
            audioOriginalPath: audioPath,
            audioProcessedPath: undefined,
            timeline: undefined,
            latestTimelinePath: undefined,
            alignmentStatus: 'none' as const,
            renderStatus: 'none' as const,
            status: 'draft' as const,
            errorMessage: undefined,
            updatedAt: new Date().toISOString()
        };

        // Complete reset of the dependent timeline context
        const { projectSceneRepository } = await import('@/src/server/repositories/ProjectSceneRepository');
        const { jobRepository } = await import('@/src/server/repositories/JobRepository');
        
        await projectSceneRepository.deleteByProjectId(id);
        
        // Find existing jobs for this project and mark them failed/canceled or just delete them?
        // Wait, the easiest way is to delete them. There's no deleteByProjectId in JobRepository right now? I will just clear them from DB.
        const db = (await import('@/src/server/database/db')).default;
        db.prepare('DELETE FROM render_jobs WHERE projectId = ?').run(id);

        await projectRepository.save(updatedProject);
        return NextResponse.json(updatedProject);
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
