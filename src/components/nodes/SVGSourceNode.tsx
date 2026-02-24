import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Image as ImageIcon, ArrowDown } from 'lucide-react';

export default function SVGSourceNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();

    // Determine current mode and data
    const isMorphMode = data.isMorphMode || false;
    const svgContent = data.svg || '';
    const svgBefore = data.svgBefore || '';
    const svgAfter = data.svgAfter || '';

    // Standard Handlers
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { svg: e.target.value });
    };

    const handleClear = () => {
        updateNodeData(id, { svg: '', svgBefore: '', svgAfter: '' });
    };

    // Morph Handlers
    const toggleMorphMode = () => {
        updateNodeData(id, {
            isMorphMode: !isMorphMode,
            // Automatically migrate standard to 'before' if switching to morph
            svgBefore: !isMorphMode ? svgContent : svgBefore,
        });
    };

    const handleBeforeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { svgBefore: e.target.value });
    };

    const handleAfterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { svgAfter: e.target.value });
    };

    return (
        <div className={styles.nodeWrapper} style={{ minWidth: '280px' }}>
            <div className={styles.nodeHeader}>
                <ImageIcon size={16} /> SVG Source
            </div>

            <div className={styles.buttonRow}>
                <button className={styles.actionButtonPrimary}>Paste</button>
                <button className={styles.actionButton} onClick={handleClear}>Clear</button>
            </div>

            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                <button
                    className={styles.actionButton}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', backgroundColor: isMorphMode ? 'var(--bg-elevated)' : 'transparent', border: isMorphMode ? '1px solid var(--border-focus)' : '1px solid var(--border-dim)' }}
                    onClick={toggleMorphMode}
                >
                    <ArrowDown size={14} /> {isMorphMode ? 'Disable Morph mode' : 'Enable Morph mode'}
                </button>
            </div>

            {!isMorphMode ? (
                // STANDARD MODE
                <>
                    <div
                        className={styles.previewBox}
                        dangerouslySetInnerHTML={{ __html: svgContent || '<span style="color:var(--text-muted)">Preview</span>' }}
                    />
                    <textarea
                        className={styles.textArea}
                        value={svgContent}
                        onChange={handleChange}
                        placeholder="Paste your <svg> tag here..."
                    />
                </>
            ) : (
                // MORPH MODE
                <>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Before</div>
                    <div
                        className={styles.previewBox}
                        dangerouslySetInnerHTML={{ __html: svgBefore || '<span style="color:var(--text-muted)">Before Preview</span>' }}
                    />
                    <textarea
                        className={styles.textArea}
                        style={{ minHeight: '60px', marginBottom: '12px' }}
                        value={svgBefore}
                        onChange={handleBeforeChange}
                        placeholder="Paste 'before' <svg>..."
                    />

                    <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        <ArrowDown size={16} />
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>After</div>
                    <div
                        className={styles.previewBox}
                        dangerouslySetInnerHTML={{ __html: svgAfter || '<span style="color:var(--text-muted)">After Preview</span>' }}
                    />
                    <textarea
                        className={styles.textArea}
                        style={{ minHeight: '60px' }}
                        value={svgAfter}
                        onChange={handleAfterChange}
                        placeholder="Paste 'after' <svg>..."
                    />
                </>
            )}

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
