// File: src/components/DialogueFlow/index.tsx
import React, { useEffect, memo, useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  Position,
  NodeTypes,
  OnConnectStart,
  OnConnectEnd,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DialogueNode from './DialogueNode'; // Standard/Input node
import UserNode from './UserNode';     // User node wrapper
import NpcNode from './NpcNode';       // NPC node wrapper
import JumpNode from './JumpNode';     // Jump node wrapper
import { ToolType } from '../Toolbar';

import { useFlowData, useDialogueStore, createDialogueNode } from '../../store/dialogueStore';
import { DialogueNode as DialogueNodeType, DialogueEdge } from '../../types';

// Define nodeTypes mapping string identifiers to the component implementations
const nodeTypes: NodeTypes = {
  custom: DialogueNode, // Generic nodes
  input: DialogueNode,  // Start nodes
  user: UserNode,       // User response nodes
  npc: NpcNode,         // NPC response nodes
  jump: JumpNode,       // Jump nodes
};

// Ref type to store information about the node/handle the connection started from
interface ConnectingNodeRef {
  nodeId: string;
  handleId: string | null;
  handleType: 'source' | 'target';
}

interface DialogueFlowProps {
    isHorizontal: boolean;
    onFitViewInitialized: (fitViewFn: () => void) => void;
    currentTool: ToolType | null;
}

const DialogueFlow: React.FC<DialogueFlowProps> = memo(({
  isHorizontal,
  onFitViewInitialized,
  currentTool,
}) => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
  } = useFlowData();

  const [showStartNodeProtection] = useState(false); // State for protection message (currently unused visually)
  const reactFlowInstance = useReactFlow<DialogueNodeType, DialogueEdge>();
  const connectingNode = useRef<ConnectingNodeRef | null>(null);

  const selectedNpcId = useDialogueStore(state => state.selectedNpcId);

  // Function to trigger fitView, passed from parent via onFitViewInitialized
  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.6, duration: 400 });
  }, [reactFlowInstance]);

  // Pass the fitView function up to the parent component (App) once initialized
  useEffect(() => {
    if (onFitViewInitialized && reactFlowInstance) {
      onFitViewInitialized(handleFitView);
    }
  }, [handleFitView, onFitViewInitialized, reactFlowInstance]);

  // Capture the source node/handle when a connection drag starts
  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
      if (nodeId && handleType) {
          connectingNode.current = { nodeId, handleId, handleType };
      } else {
          connectingNode.current = null; // Reset if info is missing
      }
      console.log('[DialogueFlow] Connect start:', connectingNode.current);
  }, []);

  // Handle creating new node by dragging connection end to pane
  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const connectingInfo = connectingNode.current;
      connectingNode.current = null; // Clear the ref immediately

      // Guard clauses for invalid events or missing start info
      if (!event || !('clientX' in event) || !('clientY' in event) || !connectingInfo || !reactFlowInstance?.screenToFlowPosition || !setNodes || !setEdges) {
        console.log('[DialogueFlow] Connect end aborted: Invalid event, ref, instance, or state setters.');
        return;
      }

      const targetElement = event.target as HTMLElement;
      const targetIsPane = targetElement?.classList?.contains('react-flow__pane');

      // Only proceed if the drop target is the pane
      if (targetIsPane) {
        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        const sourceNode = reactFlowInstance.getNode(sourceNodeId);

        // Determine the type and label prefix for the new node
        let newNodeType: 'user' | 'npc' | 'custom' | 'input' | 'jump';
        let newNodeLabelPrefix: string;

        if (currentTool === 'auto') {
          newNodeType = (sourceNode?.type === 'user') ? 'npc' : 'user';
          newNodeLabelPrefix = (newNodeType === 'npc') ? 'NPC Response' : 'User Response';
          console.log(`[DialogueFlow] Auto mode: Creating ${newNodeType} node after ${sourceNode?.type} node`);
        } else if (currentTool === 'user') {
          newNodeType = 'user';
          newNodeLabelPrefix = 'User Response';
        } else if (currentTool === 'npc') {
          newNodeType = 'npc';
          newNodeLabelPrefix = 'NPC Response';
        } else if (currentTool === 'jump') { // Check if jump tool is active (if Toolbar is updated)
            newNodeType = 'jump';
            newNodeLabelPrefix = 'Jump';
        } else {
          // Default behavior if no specific tool is active
          newNodeType = (sourceNode?.type === 'input') ? 'npc' : 'user';
          newNodeLabelPrefix = (newNodeType === 'npc') ? 'NPC Response' : 'User Response';
        }

        // Calculate position for the new node based on mouse coords
        const mousePosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        // Adjust width based on type for centering calculation (rough estimate)
        const nodeWidth = (newNodeType === 'npc' || newNodeType === 'user' || newNodeType === 'jump') ? 250 : 180;
        const position = {
          x: mousePosition.x - (nodeWidth / 2),
          y: mousePosition.y
        };

        // Use the createDialogueNode helper from the store
        // Pass the determined type and selected NPC ID
        const newNode = createDialogueNode(
          newNodeType,
          newNodeLabelPrefix,
          position,
          isHorizontal,
          selectedNpcId
        );

        // Create the connecting edge
        const newEdge: DialogueEdge = {
          id: `e${sourceNodeId}-${newNode.id}-${Date.now()}`, // Ensure unique edge ID
          source: sourceNodeId,
          target: newNode.id,
          sourceHandle: sourceHandleId,
        };

        console.log(`[DialogueFlow] Creating node ${newNode.id} of type ${newNodeType} with data:`, newNode.data);
        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    // Dependencies for the useCallback hook
    [reactFlowInstance, setNodes, setEdges, isHorizontal, currentTool, selectedNpcId]
  );

  return (
    <div className="relative w-full h-full">
      {/* Add the 'dark' class to enable dark theme styling from index.css */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes} // Use the defined nodeTypes map including JumpNode
        attributionPosition="bottom-right"
        deleteKeyCode={['Delete']}
        className="dialogue-flow-canvas transition-colors duration-300 dark" // Ensure 'dark' class is present
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.6, minZoom: 0.5, maxZoom: 1.5 }}
      >
        <Controls className="transition-all duration-300 shadow-lg" />
        <MiniMap nodeStrokeWidth={3} zoomable pannable className="transition-all duration-300 shadow-lg" nodeBorderRadius={4} />
        <Background color="#aaa" gap={16} variant={BackgroundVariant.Dots} className="transition-all duration-300" />
      </ReactFlow>

      {/* Optional: Display message if start node deletion is attempted (logic not fully implemented here) */}
      {showStartNodeProtection && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-900 text-amber-200 px-4 py-2 rounded-md shadow-md border border-amber-800 z-50 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Start nodes cannot be deleted
        </div>
      )}
    </div>
  );
});

DialogueFlow.displayName = 'DialogueFlow';
export default DialogueFlow;