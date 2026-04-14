import { NextRequest, NextResponse } from 'next/server';
import { settingsRepository } from '@/src/server/repositories/SettingsRepository';

export async function GET() {
    try {
        const all = settingsRepository.getAll();
        // Mask the API key for safety
        if (all.openai_api_key) {
            all.openai_api_key = all.openai_api_key.substring(0, 8) + '...';
        }
        return NextResponse.json(all);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        Object.entries(body).forEach(([key, value]) => {
            if (typeof value === 'string') {
                // If it's a masked key being sent back, don't update it unless it's actually changed
                if (key === 'openai_api_key' && value.includes('...')) {
                    return;
                }
                settingsRepository.set(key, value);
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
