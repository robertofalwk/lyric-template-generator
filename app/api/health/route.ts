import { NextResponse } from 'next/server';
import { SystemHealthService } from '@/src/server/services/SystemHealthService';

export async function GET() {
    try {
        const health = await SystemHealthService.check();
        return NextResponse.json(health);
    } catch (error: any) {
        return NextResponse.json({ status: 'critical', error: error.message }, { status: 500 });
    }
}
