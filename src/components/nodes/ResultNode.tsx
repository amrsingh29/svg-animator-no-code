import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './nodes.module.css';
import { PlayCircle, Download, Clipboard, Play, Pause, FileCode, Sun, Moon, Save } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function ResultNode({ id, data }: any) {
    const svgContent = data.svg || '';
    const [isPaused, setIsPaused] = useState(false);
    const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { data: session } = useSession();

    // Toggle animation state
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;
        const svgElement = containerRef.current.querySelector('svg');
        if (!svgElement) return;

        if (isPaused) {
            if ('pauseAnimations' in svgElement) (svgElement as any).pauseAnimations();
            svgElement.style.animationPlayState = 'paused';
            const allElements = svgElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
                if (el.style) el.style.animationPlayState = 'paused';
            });
        } else {
            if ('unpauseAnimations' in svgElement) (svgElement as any).unpauseAnimations();
            svgElement.style.animationPlayState = 'running';
            const allElements = svgElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
                if (el.style) el.style.animationPlayState = 'running';
            });
        }
    }, [isPaused, svgContent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(svgContent);
        alert('SVG code copied to clipboard!');
    };

    const handleDownload = () => {
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'animated-design.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopyReact = () => {
        const reactComponent = `import React from 'react';

export const AnimatedIcon = () => (
    ${svgContent.replace(/class=/g, 'className=').replace(/style="([^"]*)"/g, (match: string, p1: string) => {
            const styleObj = p1.split(';').reduce((acc: any, style: string) => {
                const [key, value] = style.split(':');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {});
            return `style={${JSON.stringify(styleObj)}}`;
        })}
);`;
        navigator.clipboard.writeText(reactComponent.trim());
        alert('React component copied to clipboard!');
    };

    const handleSaveToGallery = async () => {
        if (!session) {
            alert("Please Sign In via the sidebar to save animations to your gallery.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                svgResult: svgContent,
                prompt: data.prompt || "Generated Animation",
                // Provide defaults if user hasn't explicitly named them or if they aren't available in this node's direct data payload yet
                title: "My Animation " + new Date().toLocaleTimeString(),
            };

            const response = await fetch('/api/gallery/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Successfully saved to your gallery!");
            } else {
                const resData = await response.json();
                alert(`Error: ${resData.error}`);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save animation.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.nodeWrapper} style={{ minWidth: '320px' }}>
            <Handle type="target" position={Position.Left} className={styles.handleLeft} />

            <div className={styles.nodeHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <PlayCircle size={16} /> Rendered Result
                </div>
                <div className={styles.buttonRow} style={{ border: 'none', padding: 0, margin: 0 }}>
                    <button
                        className={styles.iconButton}
                        onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                        title={`Switch to ${previewTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                    >
                        {previewTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                    <button
                        className={styles.iconButton}
                        onClick={() => setIsPaused(!isPaused)}
                        title={isPaused ? "Play" : "Pause"}
                    >
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className={styles.previewBox}
                style={{
                    minHeight: '220px',
                    position: 'relative',
                    backgroundColor: previewTheme === 'dark' ? 'var(--bg-main)' : '#ffffff',
                    transition: 'background-color 0.3s'
                }}
                dangerouslySetInnerHTML={{ __html: svgContent || '<span style="color:var(--text-muted)">Waiting for output...</span>' }}
            />

            {svgContent && (
                <div className={styles.buttonRow} style={{ marginTop: '8px' }}>
                    <button className={styles.actionButton} onClick={handleCopy} title="Copy SVG">
                        <Clipboard size={14} />
                    </button>
                    <button className={styles.actionButton} onClick={handleDownload} title="Download SVG">
                        <Download size={14} />
                    </button>
                    <button className={styles.actionButton} onClick={handleCopyReact} title="Copy as React">
                        <FileCode size={14} />
                    </button>
                    <button
                        className={styles.actionButton}
                        onClick={handleSaveToGallery}
                        disabled={isSaving}
                        title={isSaving ? "Saving..." : "Save to Gallery"}
                        style={{ opacity: isSaving ? 0.5 : 1 }}
                    >
                        <Save size={14} />
                    </button>
                </div>
            )}

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
