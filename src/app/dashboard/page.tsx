import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Code2 } from "lucide-react";

export default async function DashboardPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        redirect("/");
    }

    const savedAnimations = await db.savedSVG.findMany({
        where: { user: { email: session.user.email } },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#f4f4f5', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>My Gallery</h1>
                        <p style={{ color: '#a1a1aa', margin: 0 }}>View and manage your saved AI animations.</p>
                    </div>
                    <Link href="/" style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', backgroundColor: '#27272a',
                        color: '#f4f4f5', textDecoration: 'none',
                        borderRadius: '8px', fontWeight: 500, transition: 'background 0.2s'
                    }}>
                        <ArrowLeft size={16} /> Back to Editor
                    </Link>
                </div>

                {savedAnimations.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a' }}>
                        <Code2 size={48} style={{ color: '#52525b', margin: '0 auto 16px auto' }} />
                        <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>No animations yet</h3>
                        <p style={{ color: '#a1a1aa', margin: 0 }}>Head back to the editor and save your first generation!</p>
                    </div>
                )}

                {savedAnimations.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {savedAnimations.map((anim: any) => (
                            <div key={anim.id} style={{
                                backgroundColor: '#18181b',
                                border: '1px solid #27272a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{
                                    height: '220px',
                                    backgroundColor: '#27272a',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}
                                    dangerouslySetInnerHTML={{ __html: anim.svgResult }}
                                />
                                <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>{anim.title}</h3>
                                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#a1a1aa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        <span style={{ color: '#f4f4f5', fontWeight: 500 }}>Prompt:</span> {anim.prompt}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', color: '#71717a' }}>
                                            {new Date(anim.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
