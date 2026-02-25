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

        const { id, svgBefore, svgAfter, svgResult, prompt, title, nodes, edges } = await req.json();

        if (!nodes && !svgResult) {
            return NextResponse.json({ error: 'Cannot save an empty project.' }, { status: 400 });
        }

        let savedSVG;

        if (id) {
            const existing = await db.savedSVG.findUnique({ where: { id } });
            if (!existing) {
                return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
            }
            if (existing.userId !== user.id) {
                return NextResponse.json({ error: 'Unauthorized to update this project.' }, { status: 403 });
            }

            savedSVG = await db.savedSVG.update({
                where: { id },
                data: {
                    title: title || existing.title,
                    svgBefore: svgBefore || existing.svgBefore,
                    svgAfter: svgAfter || existing.svgAfter,
                    svgResult: svgResult || existing.svgResult,
                    prompt: prompt || existing.prompt,
                    nodes: nodes ? JSON.stringify(nodes) : existing.nodes,
                    edges: edges ? JSON.stringify(edges) : existing.edges,
                }
            });
        } else {
            savedSVG = await db.savedSVG.create({
                data: {
                    userId: user.id,
                    title: title || "Untitled Project",
                    svgBefore: svgBefore || null,
                    svgAfter: svgAfter || null,
                    svgResult: svgResult || null,
                    prompt: prompt || "",
                    nodes: nodes ? JSON.stringify(nodes) : null,
                    edges: edges ? JSON.stringify(edges) : null,
                }
            });
        }

        return NextResponse.json({ success: true, animation: savedSVG });

    } catch (error: any) {
        console.error("Save to Gallery Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to save to gallery' }, { status: 500 });
    }
}
