import { NextRequest, NextResponse } from 'next/server';
import { templateRepository } from '@/src/server/repositories/TemplateRepository';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { versionId } = await req.json();
        if (!versionId) return NextResponse.json({ error: 'versionId is required' }, { status: 400 });

        const restored = await templateRepository.restoreVersion(id, versionId);
        return NextResponse.json(restored);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
