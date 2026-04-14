import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/src/server/repositories/ProjectRepository';
import { projectSceneRepository } from '@/src/server/repositories/ProjectSceneRepository';
import { renderJobRepository } from '@/src/server/repositories/RenderJobRepository';
import { renderHistoryRepository } from '@/src/server/repositories/RenderHistoryRepository';
import { ProjectQualityGateService } from '@/src/domains/operations/ProjectQualityGateService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { formats, presetId, customTemplate } = await req.json();

        // 1. Fetch State
        const project = await projectRepository.findById(id);
        const scenes = await projectSceneRepository.findByProjectId(id);
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

        // 2. Quality Gate (V6 Ops)
        const gate = ProjectQualityGateService.validateForRender(project, scenes);
        if (!gate.passed) {
            return NextResponse.json({ 
                error: 'Quality Gate failed. Resolve blocking issues before rendering.',
                issues: gate.issues 
            }, { status: 422 });
        }

        // 3. Create Render Snapshot (V6 Ops)
        const snapshot = JSON.stringify({
            template: customTemplate || { id: project.selectedTemplateId },
            scenes: scenes,
            timestamp: new Date().toISOString()
        });

        // 4. Create History Record
        const historyId = `rh_${uuidv4().slice(0, 8)}`;
        await renderHistoryRepository.save({
            id: historyId,
            projectId: id,
            presetId: presetId || 'default',
            snapshot,
            status: 'queued',
            createdAt: new Date().toISOString()
        });

        // 5. Create Job
        const jobId = uuidv4();
        await renderJobRepository.save({
            id: jobId,
            projectId: id,
            type: 'render',
            status: 'queued',
            progress: 0,
            payload: { presetId, historyId, formats, customTemplate },
            createdAt: new Date().toISOString()
        });

        // Update Project Status
        await projectRepository.updateStatus(id, 'rendering');

        return NextResponse.json({ id: jobId, historyId });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

