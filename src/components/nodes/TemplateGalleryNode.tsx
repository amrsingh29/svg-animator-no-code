import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Layers } from 'lucide-react';

const PRESET_TEMPLATES = [
    { label: "Select a template...", prompt: "" },
    { label: "Loading Spinner Ring", prompt: "A clean, modern circular loading spinner ring with gradient strokes." },
    { label: "Hamburger Menu Icon", prompt: "A 3-line hamburger menu icon, clean and minimalist." },
    { label: "Play Button", prompt: "A rounded triangle play button inside a circle, sleek design." },
    { label: "Weather: Sun & Cloud", prompt: "A cute, stylized illustration of a golden sun partially behind a fluffy white cloud." },
    { label: "Bouncing Ball Scene", prompt: "A flat design scene of a red bouncing ball resting on a blue line." },
    { label: "Geometric Robot", prompt: "A cute robot face made of simple geometric shapes (squares, circles) in vibrant colors." },
];

export default function TemplateGalleryNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();
    const isGenerating = data.isGenerating || false;
    const svgContent = data.svg || '';
    const [selectedPrompt, setSelectedPrompt] = useState(data.selectedPrompt || "");

    const handleGenerate = useCallback(async () => {
        if (!selectedPrompt) {
            alert("Please select a template from the dropdown.");
            return;
        }

        updateNodeData(id, { isGenerating: true, selectedPrompt });

        try {
            const apiKey = localStorage.getItem('gemini_api_key');

            if (!apiKey) {
                alert("Please set your Gemini API Key in Settings first.");
                updateNodeData(id, { isGenerating: false });
                return;
            }

            const payload = {
                prompt: selectedPrompt,
                mode: 'generate-svg', // Reuse the reliable generate-svg instruction
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
                alert("Error generating template: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            alert("Failed to reach API.");
        } finally {
            updateNodeData(id, { isGenerating: false });
        }
    }, [id, selectedPrompt, updateNodeData]);

    return (
        <div className={`${styles.nodeWrapper} ${isGenerating ? styles.generatingBorder : ''}`} style={{ minWidth: '260px' }}>
            <div className={styles.nodeHeader}>
                <Layers size={16} /> Template Gallery
            </div>

            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    disabled={isGenerating}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-dim)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {PRESET_TEMPLATES.map((template, idx) => (
                        <option key={idx} value={template.prompt} disabled={idx === 0}>
                            {template.label}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ padding: '0 0 12px 0', textAlign: 'center' }}>
                {isGenerating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.loader} />
                        <span style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>Generating from AI...</span>
                    </div>
                ) : (
                    <button
                        className={styles.actionButtonPrimary}
                        onClick={handleGenerate}
                        style={{ width: '100%' }}
                        disabled={!selectedPrompt}
                    >
                        Load Template
                    </button>
                )}
            </div>

            {svgContent && !isGenerating && (
                <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '12px' }}>
                    <div
                        className={styles.previewBox}
                        style={{ minHeight: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>
            )}

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
