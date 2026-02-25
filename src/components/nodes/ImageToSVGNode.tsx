import React, { useRef, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { ImageIcon } from 'lucide-react';

export default function ImageToSVGNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isGenerating = data.isGenerating || false;
    const svgContent = data.svg || '';
    const previewImage = data.previewImage || null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            // base64Data looks like: data:image/png;base64,...
            const mimeType = file.type;
            const pureBase64 = base64Data.split(',')[1];
            updateNodeData(id, {
                previewImage: base64Data,
                imageMimeType: mimeType,
                imageBase64: pureBase64
            });
        };
        reader.readAsDataURL(file);
    };

    const handleConvert = useCallback(async () => {
        if (!data.imageBase64 || !data.imageMimeType) {
            alert("Please upload an image first.");
            return;
        }

        updateNodeData(id, { isGenerating: true });

        try {
            const apiKey = localStorage.getItem('gemini_api_key');

            if (!apiKey) {
                alert("Please set your Gemini API Key in Settings first.");
                updateNodeData(id, { isGenerating: false });
                return;
            }

            const payload = {
                mode: 'image-to-svg',
                imageMimeType: data.imageMimeType,
                imageBase64: data.imageBase64,
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
                alert("Error converting image: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            alert("Failed to reach API.");
        } finally {
            updateNodeData(id, { isGenerating: false });
        }
    }, [id, data, updateNodeData]);

    return (
        <div className={`${styles.nodeWrapper} ${isGenerating ? styles.generatingBorder : ''}`} style={{ minWidth: '280px' }}>
            <div className={styles.nodeHeader}>
                <ImageIcon size={16} /> Image to SVG
            </div>

            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        border: '2px dashed var(--border-dim)',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: previewImage ? 'transparent' : 'var(--text-secondary)',
                        position: 'relative',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--bg-elevated)',
                        overflow: 'hidden'
                    }}
                >
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Upload preview"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                        />
                    )}
                    <span style={{ position: 'relative', zIndex: 2, background: previewImage ? 'rgba(0,0,0,0.5)' : 'transparent', color: 'white', padding: previewImage ? '4px 8px' : '0', borderRadius: '4px' }}>
                        {previewImage ? 'Click to change' : 'Upload Image'}
                    </span>
                </div>
            </div>

            <div style={{ padding: '4px 0 12px 0', textAlign: 'center' }}>
                {isGenerating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.loader} />
                        <span style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>Vectorizing...</span>
                    </div>
                ) : (
                    <button
                        className={styles.actionButtonPrimary}
                        onClick={handleConvert}
                        style={{ width: '100%' }}
                        disabled={!previewImage}
                    >
                        Convert to SVG
                    </button>
                )}
            </div>

            {svgContent && !isGenerating && (
                <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Result</div>
                    <div
                        className={styles.previewBox}
                        style={{ minHeight: '80px', display: 'flex', justifyContent: 'center' }}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                </div>
            )}

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
