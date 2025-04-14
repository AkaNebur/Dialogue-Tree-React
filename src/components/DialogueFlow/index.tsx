// File: src/components/DialogueFlow/index.tsx
import React, { useEffect, memo, useCallback, useRef, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  Position,
  NodeTypes,
  OnConnectStart, // Added
  OnConnectEnd,   // Added
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DialogueNode from './DialogueNode'; // Standard/Input node
import UserNode from './UserNode';     // User node wrapper
import NpcNode from './NpcNode';       // NPC node wrapper
import { ToolType } from '../Toolbar';

import { useFlowData } from '../../store/dialogueStore';
import { getNextNodeId } from '../../constants/initialData';
import { DialogueNode as DialogueNodeType, DialogueEdge } from '../../types';

// Define nodeTypes mapping string identifiers to the component implementations
const nodeTypes: NodeTypes = {
  custom: DialogueNode, // Generic nodes
  input: DialogueNode,  // Start nodes
  user: UserNode,       // User response nodes
  npc: NpcNode,         // NPC response nodes
};

// Ref type to store information about the node/handle the connection started from
interface ConnectingNodeRef {
  nodeId: string;
  handleId: string | null; // Handle ID can be null for default handles
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

  const [showStartNodeProtection] = useState(false);
  // Get the ReactFlow instance for converting screen coords to flow coords
  const reactFlowInstance = useReactFlow<DialogueNodeType, DialogueEdge>();
  // Ref to store connection start details
  const connectingNode = useRef<ConnectingNodeRef | null>(null);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.6, duration: 400 });
  }, [reactFlowInstance]);

  useEffect(() => {
    if (onFitViewInitialized && reactFlowInstance) {
      onFitViewInitialized(handleFitView);
    }
  }, [handleFitView, onFitViewInitialized, reactFlowInstance]);

  // Capture the source node/handle when a connection drag starts
  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
      if (nodeId && handleType) { // Ensure we have the necessary info
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
      connectingNode.current = null; // Clear the ref after use

      // Guard against invalid events or missing connection start info
      if (!event || !('clientX' in event) || !('clientY' in event) || !connectingInfo || !reactFlowInstance || !reactFlowInstance.screenToFlowPosition || !setNodes || !setEdges) {
        console.log('[DialogueFlow] Connect end aborted: Invalid event, ref, instance, or state setters.');
        return;
      }

      const targetElement = event.target as HTMLElement;
      const targetIsPane = targetElement?.classList?.contains('react-flow__pane');

      // Only proceed if the drop target is the pane
      if (targetIsPane) {
        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        const newNodeId = getNextNodeId();

        let newNodeType: 'user' | 'npc' | 'custom' | 'input';
        let newNodeLabelPrefix: string;

        // Get source node to determine its type
        const sourceNode = reactFlowInstance.getNode(sourceNodeId);
        
        // Determine new node type based on auto mode, current tool, or source node type
        if (currentTool === 'auto') {
          // Auto alternating mode - determine opposite of source node
          if (sourceNode?.type === 'user') {
            newNodeType = 'npc';
            newNodeLabelPrefix = 'NPC Response';
          } else if (sourceNode?.type === 'npc' || sourceNode?.type === 'input') {
            newNodeType = 'user';
            newNodeLabelPrefix = 'User Response';
          } else {
            // Default fallback
            newNodeType = 'user';
            newNodeLabelPrefix = 'User Response';
          }
          console.log(`[DialogueFlow] Auto mode: Creating ${newNodeType} node after ${sourceNode?.type} node`);
        } else if (currentTool === 'user') {
          newNodeType = 'user';
          newNodeLabelPrefix = 'User Response';
        } else if (currentTool === 'npc') {
          newNodeType = 'npc';
          newNodeLabelPrefix = 'NPC Response';
        } else {
          // Default: NPC follows start, User follows anything else
          newNodeType = (sourceNode?.type === 'input') ? 'npc' : 'user';
          newNodeLabelPrefix = (newNodeType === 'npc') ? 'NPC Response' : 'User Response';
        }

        // Get raw mouse position and convert to flow position
        const mousePosition = reactFlowInstance.screenToFlowPosition({ 
          x: event.clientX, 
          y: event.clientY 
        });
        
        // Get node dimensions based on node type - adjust these values based on actual rendered sizes
        const nodeWidth = newNodeType === 'npc' || newNodeType === 'user' ? 250 : 180;
        
        // Calculate position so mouse is at center-top of node
        const position = {
          x: mousePosition.x - (nodeWidth / 2),
          y: mousePosition.y
        };

        const newNode: DialogueNodeType = {
          id: newNodeId,
          type: newNodeType,
          position: position,
          data: { label: `${newNodeLabelPrefix} ${newNodeId}`, text: '' },
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
        };

        const newEdge: DialogueEdge = {
          id: `e${sourceNodeId}-${newNodeId}-${Date.now()}`, // Ensure unique edge ID
          source: sourceNodeId,
          target: newNodeId,
          sourceHandle: sourceHandleId, // Use the handle the connection started from
        };

        console.log(`[DialogueFlow] Creating node ${newNodeId} of type ${newNodeType} at position:`, position);
        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [reactFlowInstance, setNodes, setEdges, isHorizontal, currentTool] // Dependencies for the callback
  );

  return (
    <div className="relative w-full h-full">
      {/* Add the 'dark' class directly here */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart} // Pass the start handler
        onConnectEnd={onConnectEnd}   // Pass the end handler
        nodeTypes={nodeTypes} // Use the defined nodeTypes map
        attributionPosition="bottom-right"
        deleteKeyCode={['Delete']}
        className="dialogue-flow-canvas transition-colors duration-300 dark"
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

      {/* Start Node Protection Message */}
      {showStartNodeProtection && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-900 text-amber-200 px-4 py-2 rounded-md shadow-md border border-amber-800 z-50 flex items-center"> {/* Adjusted for dark */}
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