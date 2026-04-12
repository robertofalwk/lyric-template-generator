import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const formData = await req.formData();
        const file = formData.get('audio') as File;
        if (!file) return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });

        const projectDir = path.join(process.cwd(), 'storage', 'projects', id);
        await mkdir(projectDir, { recursive: true });

        const audioPath = path.join(projectDir, 'audio_original.mp3');
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(audioPath, buffer);

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
