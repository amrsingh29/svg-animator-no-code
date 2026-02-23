"use client";

import React, { useState, useCallback } from "react";
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import SVGSourceNode from "./nodes/SVGSourceNode";
import PromptNode from "./nodes/PromptNode";
import AIGenerationNode from "./nodes/AIGenerationNode";
import ResultNode from "./nodes/ResultNode";

const nodeTypes = {
    svgSource: SVGSourceNode,
    prompt: PromptNode,
    aiGeneration: AIGenerationNode,
    result: ResultNode,
};

const initialNodes: Node[] = [
    { id: "1", type: "svgSource", position: { x: 100, y: 150 }, data: { svg: "" } },
    { id: "2", type: "prompt", position: { x: 100, y: 550 }, data: { prompt: "" } },
    { id: "3", type: "aiGeneration", position: { x: 550, y: 300 }, data: { isGenerating: false, onGenerate: () => console.log('Generate clicked') } },
    { id: "4", type: "result", position: { x: 950, y: 300 }, data: { svg: "" } },
];

const initialEdges: Edge[] = [
    { id: "e1-3", source: "1", target: "3", targetHandle: "svg-in", animated: true },
    { id: "e2-3", source: "2", target: "3", targetHandle: "prompt-in", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
];

export default function FlowWorkspace() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="#27272a" variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
