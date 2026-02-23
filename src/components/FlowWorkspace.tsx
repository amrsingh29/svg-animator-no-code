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
import ContextMenu, { MenuContextType } from "./ContextMenu";

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
    const [menu, setMenu] = useState<MenuContextType | null>(null);
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

    const onPaneContextMenu = useCallback(
        (event: React.MouseEvent | MouseEvent) => {
            event.preventDefault();
            setMenu({
                x: event.clientX,
                y: event.clientY,
            });
        },
        []
    );

    const onPaneClick = useCallback(() => {
        setMenu(null);
    }, []);

    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            // Instead of pane menu, we can trigger the link node menu
            // but usually right-click is edit, we will map '+' button for this exactly.
            // We can provide a global function to nodes via Context or simply listen to custom events
        },
        []
    );

    // We attach a global event listener to handle '+' button clicks from nodes
    React.useEffect(() => {
        const handleAddNodeEvent = (e: CustomEvent) => {
            setMenu({
                x: e.detail.x,
                y: e.detail.y,
                sourceNodeId: e.detail.sourceNodeId,
            });
        };
        window.addEventListener('openAddNodeMenu' as any, handleAddNodeEvent);
        return () => window.removeEventListener('openAddNodeMenu' as any, handleAddNodeEvent);
    }, []);

    return (
        <div style={{ display: 'flex', width: "100vw", height: "100vh" }} onClick={onPaneClick}>
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
                    onPaneContextMenu={onPaneContextMenu}
                    fitView
                >
                    <Background color="#27272a" variant={BackgroundVariant.Dots} gap={16} size={1} />
                    <Controls />
                </ReactFlow>
                {menu && <ContextMenu context={menu} onClose={() => setMenu(null)} getNodeId={getId} />}
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


