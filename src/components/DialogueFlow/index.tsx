// File: src/components/DialogueFlow/index.tsx
// *** MODIFIED ***
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
  XYPosition, // Import XYPosition
} from 'reactflow';
import 'reactflow/dist/style.css';

import DialogueNode from './DialogueNode'; // Standard/Input node
import UserNode from './UserNode';     // User node wrapper
import NpcNode from './NpcNode';       // NPC node wrapper
import JumpNode from './JumpNode';     // Jump node wrapper // *** ADDED IMPORT ***
import { ToolType, DraggableNodeType } from '../Toolbar'; // Import DraggableNodeType

import { useFlowData, useDialogueStore, createDialogueNode } from '../../store/dialogueStore';
import { DialogueNode as DialogueNodeType, DialogueEdge } from '../../types';

// Define nodeTypes mapping string identifiers to the component implementations
const nodeTypes: NodeTypes = {
  custom: DialogueNode, // Generic nodes
  input: DialogueNode,  // Start nodes
  user: UserNode,       // User response nodes
  npc: NpcNode,         // NPC response nodes
  jump: JumpNode,       // Jump nodes // *** ADDED JUMP TYPE ***
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
    currentTool: ToolType | null; // Keep for connectEnd logic if needed
}

const DialogueFlow: React.FC<DialogueFlowProps> = memo(({
  isHorizontal,
  onFitViewInitialized,
  currentTool, // Keep for connectEnd logic
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
  const reactFlowWrapper = useRef<HTMLDivElement>(null); // Ref for the wrapper div

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
        // *** Jump nodes are NOT created via drag-connect, only user/npc/auto ***
        let newNodeType: 'user' | 'npc' | 'custom' | 'input'; // Removed 'jump'
        let newNodeLabelPrefix: string;

        // Node creation logic based on *currentTool* when dragging from a node
        if (currentTool === 'auto') {
          newNodeType = (sourceNode?.type === 'user') ? 'npc' : 'user';
          newNodeLabelPrefix = (newNodeType === 'npc') ? 'NPC Response' : 'User Response';
          console.log(`[DialogueFlow] Auto mode: Creating ${newNodeType} node after ${sourceNode?.type} node`);
        } else if (currentTool === 'user') {
            // If user tool is active, always create user node
            newNodeType = 'user';
            newNodeLabelPrefix = 'User Response';
        } else if (currentTool === 'npc') {
            // If npc tool is active, always create npc node
             newNodeType = 'npc';
             newNodeLabelPrefix = 'NPC Response';
        } else {
          // Default behavior if no specific tool is active (auto-alternate)
          newNodeType = (sourceNode?.type === 'input' || sourceNode?.type === 'npc') ? 'user' : 'npc';
          newNodeLabelPrefix = (newNodeType === 'npc') ? 'NPC Response' : 'User Response';
        }

        // Calculate position for the new node based on mouse coords
        const mousePosition = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY
        });
        // Adjust width based on type for centering calculation (rough estimate)
        const nodeWidth = (newNodeType === 'npc' || newNodeType === 'user') ? 250 : 180;
        const position = {
          x: mousePosition.x - (nodeWidth / 2),
          y: mousePosition.y
        };

        // Use the createDialogueNode helper from the store
        const newNode = createDialogueNode(
          newNodeType, // Pass the determined type (user/npc/custom/input)
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

        console.log(`[DialogueFlow] Creating node ${newNode.id} of type ${newNodeType} from connectEnd with data:`, newNode.data);
        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [reactFlowInstance, setNodes, setEdges, isHorizontal, currentTool, selectedNpcId]
  );

  // --- Drag and Drop from Toolbar ---

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Check if the dragged item is of the type we expect from the toolbar
    if (event.dataTransfer.types.includes('application/reactflow')) {
      event.dataTransfer.dropEffect = 'move';
    } else {
      event.dataTransfer.dropEffect = 'none'; // Prevent dropping other things
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as DraggableNodeType;

      // Check if the dropped element is a valid node type from our toolbar
      // *** UPDATED check to include 'jump' ***
      if (typeof nodeType === 'undefined' || !nodeType || !['user', 'npc', 'jump'].includes(nodeType)) {
        console.warn('[DialogueFlow] onDrop: Invalid node type dropped:', nodeType);
        return;
      }

      // Check if reactFlowInstance is available
       if (!reactFlowInstance || !reactFlowWrapper.current) {
         console.error('[DialogueFlow] onDrop: React Flow instance or wrapper ref not available.');
         return;
       }

      // Calculate the position where the node should be created
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Adjust width/height based on type for centering calculation (rough estimate)
      // *** UPDATED estimates for 'jump' ***
      const nodeWidth = (nodeType === 'npc' || nodeType === 'user' || nodeType === 'jump') ? 250 : 180;
      const nodeHeight = (nodeType === 'npc' || nodeType === 'user') ? 120 : (nodeType === 'jump' ? 130 : 60); // Increased jump height slightly

      const adjustedPosition: XYPosition = {
          x: position.x - nodeWidth / 2,
          y: position.y - nodeHeight / 2, // Center vertically too
      };

      // Determine label prefix based on type
      // *** ADDED case for 'jump' ***
      let newNodeLabelPrefix: string;
      switch (nodeType) {
        case 'user': newNodeLabelPrefix = 'User Response'; break;
        case 'npc': newNodeLabelPrefix = 'NPC Response'; break;
        case 'jump': newNodeLabelPrefix = 'Jump'; break;
        default: newNodeLabelPrefix = 'New Node'; // Fallback
      }

      // Create the new node using the helper function
      const newNode = createDialogueNode(
        nodeType, // Pass the correct type ('user', 'npc', or 'jump')
        newNodeLabelPrefix,
        adjustedPosition,
        isHorizontal,
        selectedNpcId
      );

      console.log(`[DialogueFlow] Creating node ${newNode.id} of type ${nodeType} from toolbar drop with data:`, newNode.data);

      // Add the new node to the flow
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, isHorizontal, selectedNpcId] // Include dependencies
  );


  return (
    // Add the wrapper div with ref and drag handlers
    <div
        className="relative w-full h-full reactflow-wrapper"
        ref={reactFlowWrapper}
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
      {/* Add the 'dark' class to enable dark theme styling from index.css */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes} // *** Use the updated nodeTypes map including JumpNode ***
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