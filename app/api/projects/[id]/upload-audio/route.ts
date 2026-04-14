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
                return NextResponse.json({ error: 'Audio too long (max 10 mins)' }, { status: 400 });
            }
        } catch (err) {
            return NextResponse.json({ error: 'Failed to probe audio file. Is it valid?' }, { status: 400 });
        }

        const updatedProject = {
            ...project,
            audioOriginalPath: audioPath,
            updatedAt: new Date().toISOString()
        };

        await projectRepository.save(updatedProject);
        return NextResponse.json(updatedProject);
        
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
