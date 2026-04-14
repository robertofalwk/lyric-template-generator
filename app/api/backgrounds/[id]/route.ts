import { NextRequest, NextResponse } from 'next/server';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';
import { unlink } from 'fs/promises';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const asset = await backgroundAssetRepository.findById(id);
        
        if (asset && asset.localPath) {
            try {
                await unlink(asset.localPath);
            } catch (e) {
                console.warn('Could not delete file from disk:', asset.localPath);
            }
        }

        await backgroundAssetRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
