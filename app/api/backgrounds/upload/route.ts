import { NextRequest, NextResponse } from 'next/server';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

        const id = `asset_${uuidv4().slice(0, 8)}`;
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `${id}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assets');
        
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        const asset = {
            id,
            name: file.name,
            type: file.type.startsWith('video') ? 'video' : 'image',
            sourceType: 'uploaded',
            localPath: filePath,
            publicPath: `/uploads/assets/${fileName}`,
            thumbnailPath: `/uploads/assets/${fileName}`,
            tags: [],
            metadata: {},
            dominantColors: [],
            createdAt: new Date().toISOString()
        };

        // @ts-ignore
        await backgroundAssetRepository.save(asset);

        return NextResponse.json(asset);
    } catch (error: any) {
        console.error('Asset upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
