import React, { useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Sparkles } from 'lucide-react';

export default function AIGenerationNode({ id, data }: any) {
    const { getEdges, getNodes, updateNodeData } = useReactFlow();
    const isGenerating = data.isGenerating || false;

    const handleGenerate = useCallback(async () => {
        // 1. Find the connected nodes (svg source and prompt)
        const edges = getEdges();
        const nodes = getNodes();

        const svgEdge = edges.find((e) => e.target === id && e.targetHandle === 'svg-in');
        const promptEdge = edges.find((e) => e.target === id && e.targetHandle === 'prompt-in');
        const resultEdge = edges.find((e) => e.source === id);

        if (!svgEdge || !promptEdge) {
            alert("Please connect both an SVG Source and a Text Prompt to this node.");
            return;
        }

        const svgNode = nodes.find((n) => n.id === svgEdge.source);
        const promptNode = nodes.find((n) => n.id === promptEdge.source);

        if (!svgNode?.data?.svg || !promptNode?.data?.prompt) {
            alert("Please provide both an SVG content and a Text Prompt.");
            return;
        }

        // 2. Set generating state
        updateNodeData(id, { isGenerating: true });

        // 3. Call API
        try {
            const response = await fetch('/api/animate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    svg: svgNode.data.svg,
                    prompt: promptNode.data.prompt,
                }),
            });

            const result = await response.json();

            if (response.ok && result.svg) {
                // 4. Update the Result Node's data
                if (resultEdge) {
                    updateNodeData(resultEdge.target, { svg: result.svg });
                } else {
                    alert("Generated successfully, but no Result Node is connected to display it.");
                }
            } else {
                alert("Error generating SVG: " + (result.error || "Unknown error"));
            }
        } catch (err) {
            alert("Failed to reach API.");
        } finally {
            // 5. Unset generating state
            updateNodeData(id, { isGenerating: false });
        }
    }, [id, getEdges, getNodes, updateNodeData]);

    return (
        <div className={`${styles.nodeWrapper} ${isGenerating ? styles.generatingBorder : ''}`}>
            <div className={styles.nodeHeader}>
                <Sparkles size={16} /> AI Generation
            </div>

            {/* Target handle for SVG Source */}
            <Handle type="target" position={Position.Left} id="svg-in" style={{ top: '30%' }} className={styles.handleLeft} />
            {/* Target handle for Text Prompt */}
            <Handle type="target" position={Position.Left} id="prompt-in" style={{ top: '70%' }} className={styles.handleLeft} />

            <div style={{ padding: '24px 0', textAlign: 'center' }}>
                {isGenerating ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className={styles.loader} />
                        <span style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>Generating...</span>
                    </div>
                ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ready to generate</span>
                )}
            </div>

            <div className={styles.buttonRow}>
                <button
                    className={styles.actionButtonPrimary}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Generate Animation'}
                </button>
            </div>

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
            <button className={styles.plusButton} onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('openAddNodeMenu', { detail: { x: e.clientX, y: e.clientY, sourceNodeId: id } }));
            }}>+</button>
        </div>
    );
}
