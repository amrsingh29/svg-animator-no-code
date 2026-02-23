"use client";

import React, { useState, useCallback, useRef } from "react";
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
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import SVGSourceNode from "./nodes/SVGSourceNode";
import PromptNode from "./nodes/PromptNode";
import AIGenerationNode from "./nodes/AIGenerationNode";
import ResultNode from "./nodes/ResultNode";
import Sidebar from "./Sidebar";

const nodeTypes = {
    svgSource: SVGSourceNode,
    prompt: PromptNode,
    aiGeneration: AIGenerationNode,
    result: ResultNode,
};

const initialNodes: Node[] = [
    { id: "1", type: "svgSource", position: { x: 100, y: 150 }, data: { svg: "" } },
    { id: "2", type: "prompt", position: { x: 100, y: 550 }, data: { prompt: "" } },
    { id: "3", type: "aiGeneration", position: { x: 550, y: 350 }, data: { isGenerating: false } },
    { id: "4", type: "result", position: { x: 950, y: 350 }, data: { svg: "" } },
];

const initialEdges: Edge[] = [
    { id: "e1-3", source: "1", target: "3", targetHandle: "svg-in", animated: true },
    { id: "e2-3", source: "2", target: "3", targetHandle: "prompt-in", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
];

let id = 0;
const getId = () => `node_${id++}`;

function Flow() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const { screenToFlowPosition } = useReactFlow();

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            // check if the dropped element is valid
            if (!type) return;
            const parsed = JSON.parse(type);

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: parsed.type,
                position,
                data: parsed.data,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition]
    );

    return (
        <div style={{ display: 'flex', width: "100vw", height: "100vh" }}>
            <Sidebar />
            <div style={{ flexGrow: 1 }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                >
                    <Background color="#27272a" variant={BackgroundVariant.Dots} gap={16} size={1} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

export default function FlowWorkspace() {
    return (
        <ReactFlowProvider>
            <Flow />
        </ReactFlowProvider>
    );
}

