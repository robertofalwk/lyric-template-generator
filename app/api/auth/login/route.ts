import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Simple professional master credentials for V7 Studio
        if (email === 'falwk@admin.local' && password === 'studio_v7_master') {
            const response = NextResponse.json({ success: true });
            
            // Set session cookie
            response.cookies.set('studio_session', 'v7_authenticated', {
                httpOnly: true,
                secure: process.env.NODE_BIT === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ error: 'Invalid studio credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
}
