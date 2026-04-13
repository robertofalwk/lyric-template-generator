import { NextRequest, NextResponse } from 'next/server';
import { stylePackRepository } from '@/src/server/repositories/StylePackRepository';

export async function GET() {
    try {
        const packs = await stylePackRepository.findAll();
        return NextResponse.json(packs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        await stylePackRepository.save(body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
