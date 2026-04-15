import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';

import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const scenes = await projectSceneRepository.findByProjectId(id);
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        // Hydrate templates and assets within scenes
        const populatedScenes = await Promise.all(scenes.map(async scene => {
            let stock = undefined;
            if (scene.templateId) {
                stock = TEMPLATES_REGISTRY.find(t => t.id === scene.templateId);
            }
            
            let assetUrl = undefined;
            if (scene.backgroundAssetId) {
                const asset = await backgroundAssetRepository.findById(scene.backgroundAssetId);
                if (asset) assetUrl = `${baseUrl}${asset.publicPath}`;
            }

            return { 
                ...scene, 
                template: stock || undefined,
                assetUrl
            };
        }));
        
        project.scenes = populatedScenes as any;

        return NextResponse.json(project);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const project = await projectRepository.findById(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        const body = await req.json();
        const updated = { ...project, ...body, updatedAt: new Date().toISOString() };
        await projectRepository.save(updated as any);
        
        // Retornar a mesma estrutura completa e higienizada do GET
        return GET(req, { params } as any);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
