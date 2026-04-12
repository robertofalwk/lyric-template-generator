import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const project = await projectRepository.findById(id);
        
        if (!project || !project.audioOriginalPath) {
            return NextResponse.json({ error: 'Audio not found' }, { status: 404 });
        }

        const filePath = project.audioOriginalPath;
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'File missing on server' }, { status: 404 });
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_MAP[ext] || 'audio/mpeg';

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize.toString(),
                'Content-Type': contentType,
            };

            // @ts-ignore
            return new Response(file, { status: 206, headers: head });
        } else {
            const head = {
                'Content-Length': fileSize.toString(),
                'Content-Type': contentType,
            };
            const file = fs.createReadStream(filePath);
            // @ts-ignore
            return new Response(file, { status: 200, headers: head });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
