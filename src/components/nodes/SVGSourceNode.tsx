import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import styles from './nodes.module.css';
import { Image as ImageIcon } from 'lucide-react';

export default function SVGSourceNode({ id, data }: any) {
    const { updateNodeData } = useReactFlow();
    const svgContent = data.svg || '';

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateNodeData(id, { svg: e.target.value });
    };

    const handleClear = () => {
        updateNodeData(id, { svg: '' });
    };

    return (
        <div className={styles.nodeWrapper}>
            <div className={styles.nodeHeader}>
                <ImageIcon size={16} /> SVG Source
            </div>

            <div className={styles.buttonRow}>
                <button className={styles.actionButtonPrimary}>Paste</button>
                <button className={styles.actionButton} onClick={handleClear}>Clear</button>
            </div>

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

            <Handle type="source" position={Position.Right} className={styles.handleRight} />
        </div>
    );
}
