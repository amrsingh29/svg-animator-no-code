import React, { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Image as ImageIcon, MessageSquare, Sparkles, PlayCircle } from 'lucide-react';
import styles from './sidebar.module.css';

export type MenuContextType = {
    x: number;
    y: number;
    sourceNodeId?: string;
};

interface ContextMenuProps {
    context: MenuContextType;
    onClose: () => void;
    getNodeId: () => string;
}

export default function ContextMenu({ context, onClose, getNodeId }: ContextMenuProps) {
    const { screenToFlowPosition, setNodes, setEdges, getNodes } = useReactFlow();

    const addNode = useCallback((type: string, data: any) => {
        const position = screenToFlowPosition({ x: context.x, y: context.y });
        const newNodeId = getNodeId();

        const newNode = {
            id: newNodeId,
            type,
            position,
            data,
        };

        setNodes((nds) => nds.concat(newNode));

        // Auto-link logic if spawned from a node
        if (context.sourceNodeId) {
            const sourceNode = getNodes().find(n => n.id === context.sourceNodeId);
            let targetHandle = undefined;

            if (type === 'aiGeneration' && sourceNode) {
                if (sourceNode.type === 'svgSource' || sourceNode.type === 'result') {
                    targetHandle = 'svg-in';
                } else if (sourceNode.type === 'prompt') {
                    targetHandle = 'prompt-in';
                }
            }

            setEdges((eds) => eds.concat({
                id: `e${context.sourceNodeId}-${newNodeId}`,
                source: context.sourceNodeId as string,
                target: newNodeId,
                targetHandle,
                animated: true,
            }));
        }

        onClose();
    }, [context, screenToFlowPosition, getNodeId, setNodes, setEdges, getNodes, onClose]);

    const menuItems = [
        { label: 'SVG Source', type: 'svgSource', icon: ImageIcon, data: { svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f97316" /></svg>' } },
        { label: 'Text Prompt', type: 'prompt', icon: MessageSquare, data: { prompt: '' } },
        { label: 'AI Generation', type: 'aiGeneration', icon: Sparkles, data: { isGenerating: false } },
        { label: 'Render Result', type: 'result', icon: PlayCircle, data: { svg: '' } },
    ];

    return (
        <div
            style={{
                position: 'absolute',
                top: context.y,
                left: context.x,
                zIndex: 1000,
                backgroundColor: 'var(--bg-node)',
                border: '1px solid var(--border-focus)',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                padding: '8px',
                minWidth: '200px',
            }}
            className={styles.contextMenu}
        >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Add Block
            </div>
            {menuItems.map((item) => (
                <button
                    key={item.label}
                    onClick={() => addNode(item.type, item.data)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '13px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-dim)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <item.icon size={16} style={{ color: 'var(--text-secondary)' }} />
                    {item.label}
                </button>
            ))}
        </div>
    );
}
