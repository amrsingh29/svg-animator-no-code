"use client";

import { useSession, signIn } from "next-auth/react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toPng } from 'html-to-image';
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
import GenerateSVGNode from "./nodes/GenerateSVGNode";
import IconLibraryNode from "./nodes/IconLibraryNode";
import ImageToSVGNode from "./nodes/ImageToSVGNode";
import TemplateGalleryNode from "./nodes/TemplateGalleryNode";
import Sidebar from "./Sidebar";
import ContextMenu, { MenuContextType } from "./ContextMenu";
import SettingsModal from "./SettingsModal";

const nodeTypes = {
    svgSource: SVGSourceNode,
    prompt: PromptNode,
    aiGeneration: AIGenerationNode,
    result: ResultNode,
    generateSvg: GenerateSVGNode,
    iconLibrary: IconLibraryNode,
    imageToSvg: ImageToSVGNode,
    templateGallery: TemplateGalleryNode,
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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [projectTitle, setProjectTitle] = useState("");
    const { screenToFlowPosition, setViewport } = useReactFlow();

    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get('project');

    useEffect(() => {
        if (projectId) {
            fetch(`/api/gallery/load?id=${projectId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.project) {
                        if (data.project.title) setProjectTitle(data.project.title);
                        if (data.project.nodes) setNodes(JSON.parse(data.project.nodes));
                        if (data.project.edges) setEdges(JSON.parse(data.project.edges));
                        // Give it a moment to render nodes before fitting view
                        setTimeout(() => {
                            // Optionally fit view here, but ReactFlow fitView prop usually handles initial load
                        }, 100);
                    }
                })
                .catch(err => console.error("Failed to load project", err));
        }
    }, [projectId]);

    const handleSaveProject = async () => {
        const projectName = prompt("Enter a name for your project:", projectTitle || `Project ${new Date().toLocaleDateString()}`);
        if (!projectName) return; // User cancelled

        setIsSaving(true);
        try {
            let snapshotHtml = '<div style="color:#71717a">WIP Canvas</div>';
            // Capture the entire react-flow container instead of just the viewport to avoid cutoff
            const flowNode = document.querySelector('.react-flow') as HTMLElement;
            if (flowNode) {
                try {
                    const dataUrl = await toPng(flowNode, {
                        backgroundColor: '#09090b',
                        cacheBust: true, // Helps with Webpack dev server image resolving
                        filter: (node) => {
                            // Exclude controls/minimap from the snapshot
                            return !node.classList?.contains('react-flow__controls') && !node.classList?.contains('react-flow__panel');
                        }
                    });
                    snapshotHtml = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;" alt="Canvas Snapshot" />`;
                } catch (imgErr) {
                    console.error("Failed to generate snapshot", imgErr);
                }
            }

            const res = await fetch('/api/gallery/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: projectId || undefined,
                    title: projectName,
                    nodes,
                    edges,
                    svgResult: snapshotHtml
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Project saved successfully!");
                setProjectTitle(projectName);
                if (!projectId) {
                    router.push(`/?project=${data.animation.id}`);
                }
            } else {
                alert(data.error || "Failed to save project.");
            }
        } catch (error) {
            console.error(error);
            alert("Error saving project.");
        } finally {
            setIsSaving(false);
        }
    };

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

    const { data: session, status } = useSession();

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

    if (status === "loading") {
        return (
            <div style={{ display: 'flex', width: "100vw", height: "100vh", backgroundColor: '#09090b', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading workspace...</span>
                </div>
            </div>
        );
    }

    if (!session) {
        // Fallback in case they somehow reach here before redirect or while hydrating on the client
        return null;
    }

    return (
        <div style={{ display: 'flex', width: "100vw", height: "100vh" }} onClick={onPaneClick}>
            <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
            <div style={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
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

                {/* Save Project Button Overlay */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10 }}>
                    <button
                        onClick={handleSaveProject}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-dim)',
                            borderRadius: '8px',
                            cursor: isSaving ? 'default' : 'pointer',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-dim)'}
                    >
                        {isSaving ? 'Saving...' : (projectId ? 'Update Project' : 'Save Project')}
                    </button>
                </div>

                {menu && <ContextMenu context={menu} onClose={() => setMenu(null)} getNodeId={getId} />}
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
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


