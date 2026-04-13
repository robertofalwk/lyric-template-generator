import { NextRequest, NextResponse } from 'next/server';
import { backgroundAssetRepository } from '@/src/server/repositories/BackgroundAssetRepository';

export async function GET() {
    try {
        const assets = await backgroundAssetRepository.findAll();
        return NextResponse.json(assets);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await backgroundAssetRepository.save(body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
