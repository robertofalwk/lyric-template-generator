import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { ProjectSchema } from '@/src/schemas';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const projectId = uuidv4();
        
        const project = ProjectSchema.parse({
            id: projectId,
            title: body.title || 'Untitled Project',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            audioOriginalPath: '',
            lyricsRaw: body.lyrics || '',
            selectedTemplateId: body.templateId || TEMPLATES_REGISTRY[0].id,
            aspectRatio: body.aspectRatio || '9:16',
            status: 'draft',
            alignmentStatus: 'pending',
            renderStatus: 'pending',
            settings: body.settings || {
                useVocalIsolation: false,
                language: 'pt',
                wordLevelTiming: true,
                globalOffsetMs: 0
            }
        });

        await projectRepository.save(project);
        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function GET() {
    const projects = await projectRepository.findAll();
    return NextResponse.json(projects);
}
