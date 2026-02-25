import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const project = await db.savedSVG.findUnique({
            where: { id }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to delete this project' }, { status: 403 });
        }

        await db.savedSVG.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
    }
}
