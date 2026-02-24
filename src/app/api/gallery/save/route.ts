import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized: Must be logged in to save.' }, { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
        }

        const { svgBefore, svgAfter, svgResult, prompt, title } = await req.json();

        if (!svgResult || !prompt) {
            return NextResponse.json({ error: 'Missing required generated SVG or prompt.' }, { status: 400 });
        }

        const savedSVG = await db.savedSVG.create({
            data: {
                userId: user.id,
                title: title || "Untitled Animation",
                svgBefore: svgBefore || null,
                svgAfter: svgAfter || null,
                svgResult,
                prompt,
            }
        });

        return NextResponse.json({ success: true, animation: savedSVG });

    } catch (error: any) {
        console.error("Save to Gallery Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to save to gallery' }, { status: 500 });
    }
}
