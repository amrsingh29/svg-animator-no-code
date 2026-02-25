import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized: Must be logged in to load.' }, { status: 401 });
        }

        const url = new URL(req.url);
        const projectId = url.searchParams.get('id');

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required.' }, { status: 400 });
        }

        const savedSVG = await db.savedSVG.findUnique({
            where: { id: projectId }
        });

        if (!savedSVG) {
            return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
        }

        // Optional: Ensure the user owns this project (if that's desired behavior)
        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (savedSVG.userId !== user?.id) {
            return NextResponse.json({ error: 'Unauthorized to access this project.' }, { status: 403 });
        }

        return NextResponse.json({ success: true, project: savedSVG });

    } catch (error: any) {
        console.error("Load Project Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to load project.' }, { status: 500 });
    }
}
