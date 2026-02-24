import React from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import styles from './sidebar.module.css';
import {
    LayoutGrid,
    Circle,
    Square,
    Star,
    Box,
    Heart,
    MessageSquare,
    Sparkles,
    PlayCircle,
    Settings,
    LogIn,
    LogOut,
    User,
    Image // Import Image icon for Gallery
} from 'lucide-react';

const templates = [
    { name: 'Source: Circle', type: 'svgSource', icon: Circle, svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f97316" /></svg>' },
    { name: 'Source: Square', type: 'svgSource', icon: Square, svg: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#38bdf8" rx="8" /></svg>' },
    { name: 'Source: Star', type: 'svgSource', icon: Star, svg: '<svg viewBox="0 0 100 100"><polygon points="50,10 61,35 90,35 67,55 77,85 50,70 23,85 33,55 10,35 39,35" fill="#facc15" /></svg>' },
    { name: 'Source: Heart', type: 'svgSource', icon: Heart, svg: '<svg viewBox="0 0 32 32"><path d="M16 28 C 16 28 3 19.5 3 10.5 C 3 6 6 3 10.5 3 C 13.5 3 16 5.5 16 5.5 C 16 5.5 18.5 3 21.5 3 C 26 3 29 6 29 10.5 C 29 19.5 16 28 16 28 Z" fill="#ef4444" /></svg>' },
    { name: 'Source: Gear', type: 'svgSource', icon: Box, svg: '<svg viewBox="0 0 100 100"><path d="M50 20 a 30 30 0 1 0 0.01 0 z m 0 20 a 10 10 0 1 1 -0.01 0 z" fill="#10b981" fill-rule="evenodd"/><rect x="46" y="10" width="8" height="15" fill="#10b981" rx="2" /><rect x="46" y="75" width="8" height="15" fill="#10b981" rx="2" /><rect x="10" y="46" width="15" height="8" fill="#10b981" rx="2" /><rect x="75" y="46" width="15" height="8" fill="#10b981" rx="2" /></svg>' },
    { name: 'Text Prompt', type: 'prompt', icon: MessageSquare, svg: '' },
    { name: 'AI Generator', type: 'aiGeneration', icon: Sparkles, svg: '' },
    { name: 'Render Result', type: 'result', icon: PlayCircle, svg: '' },
];

export default function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const { data: session } = useSession();

    const onDragStart = (event: React.DragEvent, template: typeof templates[0]) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: template.type,
            data: { svg: template.svg, prompt: '', isGenerating: false }
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className={styles.sidebar} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1 }}>
                <div className={styles.description}>
                    <LayoutGrid size={18} />
                    <span>Components</span>
                </div>
                <div className={styles.templateList}>
                    {templates.map((template) => (
                        <div
                            key={template.name}
                            className={styles.templateItem}
                            onDragStart={(event) => onDragStart(event, template)}
                            draggable
                        >
                            <template.icon size={20} />
                            <span>{template.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-dim)' }}>
                {session ? (
                    <>
                        <div style={{ padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {session.user?.image ? (
                                <img src={session.user.image} alt="Profile" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            ) : (
                                <User size={20} />
                            )}
                            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {session.user?.name}
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                title="Sign Out"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                        <Link href="/dashboard" className={styles.templateItem} style={{ textDecoration: 'none', marginBottom: '8px', justifyContent: 'center' }}>
                            <Image size={20} />
                            <span>My Animations</span>
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={() => signIn("google")}
                        className={styles.templateItem}
                        style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-primary)', justifyContent: 'center', marginBottom: '8px' }}
                    >
                        <LogIn size={20} />
                        <span>Sign In</span>
                    </button>
                )}

                {onOpenSettings && (
                    <button
                        onClick={onOpenSettings}
                        className={styles.templateItem}
                        style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-secondary)' }}
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                )}
            </div>
        </aside>
    );
}
