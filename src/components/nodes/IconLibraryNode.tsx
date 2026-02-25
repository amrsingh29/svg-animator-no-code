import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Search } from 'lucide-react';

export default function IconLibraryNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();
    const isGenerating = data.isGenerating || false;
    const svgContent = data.svg || '';
    const [searchQuery, setSearchQuery] = useState(data.searchQuery || '');

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            alert("Please enter an icon search term.");
            return;
        }

        updateNodeData(id, { isGenerating: true, searchQuery });

        try {
            const apiKey = localStorage.getItem('gemini_api_key');

            if (!apiKey) {
                alert("Please set your Gemini API Key in Settings first.");
                updateNodeData(id, { isGenerating: false });
                return;
            }

            const payload = {
                prompt: searchQuery,
                mode: 'icon-library',
                apiKey
            };

            const response = await fetch('/api/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.svg) {
                updateNodeData(id, { svg: result.svg });
            } else {
                alert("Error generating icon: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            alert("Failed to reach API.");
        } finally {
            updateNodeData(id, { isGenerating: false });
        }
    }, [id, searchQuery, updateNodeData]);

    return (
        <div className={`${styles.nodeWrapper} ${isGenerating ? styles.generatingBorder : ''}`} style={{ minWidth: '240px' }}>
            <div className={styles.nodeHeader}>
                <Search size={16} /> Icon Library
            </div>

            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for an icon (e.g., 'rocket')"
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-dim)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    disabled={isGenerating}
                />
            </div>

            <div
                className={styles.previewBox}
                style={{
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-dim)'
                }}
            >
                {isGenerating ? (
                    <div className={styles.loader} />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: svgContent || '<span style="color:var(--text-muted)">Icon preview</span>' }} style={{ width: '48px', height: '48px' }} />
                )}
            </div>

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
