import React from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './nodes.module.css';
import { PlayCircle } from 'lucide-react';

export default function ResultNode({ data }: any) {
    const svgContent = data.svg || '';

    return (
        <div className={styles.nodeWrapper}>
            <Handle type="target" position={Position.Left} className={styles.handleLeft} />

            <div className={styles.nodeHeader}>
                <PlayCircle size={16} /> Rendered Result
            </div>

            <div
                className={styles.previewBox}
                style={{ minHeight: '200px' }}
                dangerouslySetInnerHTML={{ __html: svgContent || '<span style="color:var(--text-muted)">Waiting for output...</span>' }}
            />

        </div>
    );
}
