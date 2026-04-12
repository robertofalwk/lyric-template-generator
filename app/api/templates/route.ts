import { NextResponse } from 'next/server';
import { TEMPLATES_REGISTRY } from '@/src/domains/templates/registry';

export async function GET() {
    return NextResponse.json(TEMPLATES_REGISTRY);
}
