import { NextRequest, NextResponse } from 'next/server';
import { jobRepository } from '@/src/server/repositories/JobRepository';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const job = await jobRepository.findById(id);

        if (!job) {
            return new NextResponse('Job not found', { status: 404 });
        }

        if (job.status !== 'completed' || !job.outputPath) {
            return new NextResponse('Job not completed or output path missing', { status: 400 });
        }

        const normalizedOutputPath = job.outputPath.replace(/^\/+/, '');
        const filePath = path.join(process.cwd(), 'public', normalizedOutputPath);

        try {
            const fileBuffer = await readFile(filePath);
            const headers = new Headers();
            headers.set('Content-Type', 'video/mp4');
            headers.set('Content-Disposition', `attachment; filename="lyric_lab_export_${id}.mp4"`);
            headers.set('Content-Length', fileBuffer.length.toString());

            return new NextResponse(fileBuffer, {
                status: 200,
                headers,
            });
        } catch (e) {
            console.error('[Download API Error] File not found at path:', filePath, e);
            return new NextResponse('Output file not found on disk', { status: 404 });
        }
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}
