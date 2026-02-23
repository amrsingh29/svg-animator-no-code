import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Type } from 'lucide-react';

export default function PromptNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();
    const prompt = data.prompt || '';

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { prompt: e.target.value });
    };

    return (
        <div className={styles.nodeWrapper}>
            <div className={styles.nodeHeader}>
                <Type size={16} /> Text Prompt
            </div>

            <textarea
                className={styles.textArea}
                value={prompt}
                onChange={handleChange}
                placeholder="e.g. Make the character jump up and down..."
            />

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
