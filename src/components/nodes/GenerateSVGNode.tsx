import React, { useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Wand2 } from 'lucide-react';

export default function GenerateSVGNode({ id, data }: any) {
    const { getEdges, getNodes, updateNodeData } = useReactFlow();
    const isGenerating = data.isGenerating || false;
    const svgContent = data.svg || '';

    const handleGenerate = useCallback(async () => {
        const edges = getEdges();
        const nodes = getNodes();

        const promptEdge = edges.find((e) => e.target === id && e.targetHandle === 'prompt-in');

        if (!promptEdge) {
            alert("Please connect a Text Prompt node into the input of this node.");
            return;
        }

        const promptNode = nodes.find((n) => n.id === promptEdge.source);

        if (!promptNode?.data?.prompt) {
            alert("The connected Text Prompt is empty.");
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
                prompt: promptNode.data.prompt,
                mode: 'generate-svg',
                apiKey
            };

            const response = await fetch('/api/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.svg) {
                // Update this node's data so downstream nodes can read the SVG
                updateNodeData(id, { svg: result.svg });
            } else {
                alert("Error generating SVG: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            alert("Failed to reach API.");
        } finally {
            updateNodeData(id, { isGenerating: false });
        }
    }, [id, getEdges, getNodes, updateNodeData]);

    return (
        <div className={`${styles.nodeWrapper} ${isGenerating ? styles.generatingBorder : ''}`} style={{ minWidth: '280px' }}>
            <div className={styles.nodeHeader}>
                <Wand2 size={16} /> Generate SVG
            </div>

            <Handle type="target" position={Position.Left} id="prompt-in" className={styles.handleLeft} />

            <div style={{ marginTop: '12px' }}>
                <div
                    className={styles.previewBox}
                    style={{ minHeight: '120px' }}
                    dangerouslySetInnerHTML={{ __html: svgContent || '<span style="color:var(--text-muted)">Generated preview</span>' }}
                />
            </div>

            <div style={{ padding: '12px 0 0 0', textAlign: 'center' }}>
                {isGenerating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.loader} />
                        <span style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>Generating structure...</span>
                    </div>
                ) : (
                    <button
                        className={styles.actionButtonPrimary}
                        onClick={handleGenerate}
                        style={{ width: '100%' }}
                    >
                        Generate Graphic
                    </button>
                )}
            </div>

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
