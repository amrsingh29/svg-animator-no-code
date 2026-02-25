import React, { useState } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import Link from 'next/link';
import styles from './sidebar.module.css';
import {
    LayoutGrid,
    MessageSquare,
    Sparkles,
    PlayCircle,
    Settings,
    LogIn,
    LogOut,
    User,
    Image, // Import Image icon for Gallery
    Wand2,
    Search,
    ImageIcon,
    Layers,
    Folder,
    FilePlus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const templates = [
    { name: 'Template Gallery', type: 'templateGallery', icon: Layers, svg: '' },
    { name: 'Image to SVG', type: 'imageToSvg', icon: ImageIcon, svg: '' },
    { name: 'Icon Library', type: 'iconLibrary', icon: Search, svg: '' },
    { name: 'Generate SVG', type: 'generateSvg', icon: Wand2, svg: '' },
    { name: 'Text Prompt', type: 'prompt', icon: MessageSquare, svg: '' },
    { name: 'AI Generator', type: 'aiGeneration', icon: Sparkles, svg: '' },
    { name: 'Render Result', type: 'result', icon: PlayCircle, svg: '' },
];

export default function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const { data: session } = useSession();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const onDragStart = (event: React.DragEvent, template: typeof templates[0]) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({
            type: template.type,
            data: { svg: template.svg, prompt: '', isGenerating: false }
        }));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div style={{ flexGrow: 1 }}>
                <div className={styles.description}>
                    <div className={styles.descriptionInner} style={{ display: isCollapsed ? 'none' : 'flex' }}>
                        <LayoutGrid size={18} />
                        <span>Components</span>
                    </div>
                    <button
                        className={styles.toggleButton}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
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

                {session && (
                    <>
                        <div className={styles.description} style={{ marginTop: '24px' }}>
                            <div className={styles.descriptionInner} style={{ display: isCollapsed ? 'none' : 'flex' }}>
                                <Image size={18} />
                                <span>Library</span>
                            </div>
                        </div>
                        <div className={styles.templateList}>
                            <Link href="/" className={styles.templateItem} style={{ textDecoration: 'none' }}>
                                <FilePlus size={20} />
                                <span>New Project</span>
                            </Link>
                            <Link href="/projects" className={styles.templateItem} style={{ textDecoration: 'none' }}>
                                <Folder size={20} />
                                <span>My Projects</span>
                            </Link>
                            <Link href="/dashboard" className={styles.templateItem} style={{ textDecoration: 'none' }}>
                                <Image size={20} />
                                <span>My Animations</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-dim)' }}>
                {session ? (
                    <>
                        <div style={{ padding: '8px 12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            {session.user?.image ? (
                                <img src={session.user.image} alt="Profile" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                            ) : (
                                <User size={20} />
                            )}
                            <div className={styles.profileInfo} style={{ flexGrow: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {session.user?.name}
                                </div>
                            </div>
                            <button
                                className={isCollapsed ? styles.profileInfo : ''}
                                onClick={() => signOut()}
                                title="Sign Out"
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
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
        </aside >
    );
}
