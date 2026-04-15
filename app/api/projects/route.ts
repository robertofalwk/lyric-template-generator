import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const projects = await projectRepository.findAll();
        return NextResponse.json(projects);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, lyrics, aspectRatio = '9:16' } = await req.json();
        const project = {
            id: uuidv4(),
            title: title || 'Untitled Production',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            aspectRatio,
            status: 'draft' as const,
            alignmentStatus: 'none' as const,
            renderStatus: 'none' as const,
            lyricsRaw: lyrics || null,
            selectedTemplateId: 'minimal-clean',
            exportFormats: [],
            settings: {},
            scenes: [],
        };

        await projectRepository.save(project as any);
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

