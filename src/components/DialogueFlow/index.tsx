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
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import DialogueNode from './DialogueNode';
import UserNode from './UserNode';
import NpcNode from './NpcNode';
import { ToolType } from '../Toolbar';

import { useFlowData } from '../../store/dialogueStore';
import { getNextNodeId } from '../../constants/initialData';
import { DialogueNode as DialogueNodeType, DialogueEdge } from '../../types';

const nodeTypes: NodeTypes = {
  custom: DialogueNode,
  input: DialogueNode,
  user: UserNode,
  npc: NpcNode,
};

interface ConnectingNodeRef {
  nodeId: string;
  handleId: string;
  handleType: string;
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
  
  // State for showing the start node protection message
  const [showStartNodeProtection, setShowStartNodeProtection] = useState(false);

  const reactFlowInstance = useReactFlow<DialogueNodeType, DialogueEdge>();
  const connectingNode = useRef<ConnectingNodeRef | null>(null);
  const startNodeProtectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.6, duration: 400 });
  }, [reactFlowInstance]);

  useEffect(() => {
    if (onFitViewInitialized && reactFlowInstance) {
      onFitViewInitialized(handleFitView);
    }
  }, [handleFitView, onFitViewInitialized, reactFlowInstance]);

  // Show and automatically hide the start node protection message
  const showStartNodeProtectionMessage = useCallback(() => {
    setShowStartNodeProtection(true);
    
    // Clear any existing timeout
    if (startNodeProtectionTimeoutRef.current) {
      clearTimeout(startNodeProtectionTimeoutRef.current);
    }
    
    // Hide the message after 3 seconds
    startNodeProtectionTimeoutRef.current = setTimeout(() => {
      setShowStartNodeProtection(false);
      startNodeProtectionTimeoutRef.current = null;
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (startNodeProtectionTimeoutRef.current) {
        clearTimeout(startNodeProtectionTimeoutRef.current);
      }
    };
  }, []);

  // Add keyboard handler for delete keys (supports multiple names: Delete, Del, Supr)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for any variant of the delete key
      if (event.key === 'Delete' || event.key === 'Del' || event.key === 'Supr' || event.key === 'Backspace') {
        console.log(`Delete key pressed: ${event.key}`);
        
        // Get selected nodes and edges
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        // Check if trying to delete a start node
        const startNodeSelected = selectedNodes.some(node => node.type === 'input');
        if (startNodeSelected) {
          console.warn('Start nodes cannot be deleted');
          showStartNodeProtectionMessage();
        }
        
        // Create change events to delete these nodes/edges, filtering out start nodes
        const nodeChanges: NodeChange[] = selectedNodes
          .filter(node => node.type !== 'input') // Filter out start nodes
          .map(node => ({
            type: 'remove',
            id: node.id,
          }));
        
        const edgeChanges: EdgeChange[] = selectedEdges.map(edge => ({
          type: 'remove',
          id: edge.id,
        }));
        
        // Apply changes
        if (nodeChanges.length > 0) onNodesChange(nodeChanges);
        if (edgeChanges.length > 0) onEdgesChange(edgeChanges);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, edges, onNodesChange, onEdgesChange, showStartNodeProtectionMessage]);

  const handleConnectStart: OnConnectStart = useCallback((_event, params) => {
    connectingNode.current = {
      nodeId: params.nodeId || '',
      handleId: params.handleId || '',
      handleType: params.handleType || ''
    };
  }, []);

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const connectingInfo = connectingNode.current;
      connectingNode.current = null;

      if (!event || !('clientX' in event) || !('clientY' in event) || !connectingInfo || !reactFlowInstance) {
        return;
      }

      const targetElement = event.target as HTMLElement;
      const targetIsPane = targetElement?.classList?.contains('react-flow__pane');

      if (targetIsPane && reactFlowInstance.screenToFlowPosition && setNodes && setEdges) {
        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

        const newNodeId = getNextNodeId();

        let newNodeType: 'user' | 'npc' | 'custom' | 'input';
        let newNodeLabelPrefix: string;

        if (currentTool === 'user') {
          newNodeType = 'user';
          newNodeLabelPrefix = 'User Response';
        } else if (currentTool === 'npc') {
          newNodeType = 'npc';
          newNodeLabelPrefix = 'NPC Response';
        } else {
          const sourceNode = reactFlowInstance.getNode(sourceNodeId);
          if (sourceNode?.type === 'input') {
              newNodeType = 'npc';
              newNodeLabelPrefix = 'NPC Response';
          } else {
              newNodeType = 'user';
              newNodeLabelPrefix = 'User Response';
          }
          console.log(`No specific node tool selected, defaulting new node type to: ${newNodeType}`);
        }

        const newNode: DialogueNodeType = {
          id: newNodeId,
          type: newNodeType,
          position,
          data: {
            label: `${newNodeLabelPrefix} ${newNodeId}`,
            text: '', // Initialize text field
          },
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
        };

        const newEdge: DialogueEdge = {
          id: `e${sourceNodeId}-${newNodeId}-${Date.now()}`,
          source: sourceNodeId,
          target: newNodeId,
          sourceHandle: sourceHandleId,
        };

        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);
      }
    },
    [reactFlowInstance, setNodes, setEdges, isHorizontal, currentTool]
  );

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={handleConnectStart}
        onConnect={onConnect}
        onConnectEnd={handleConnectEnd}
        nodeTypes={nodeTypes}
        attributionPosition="bottom-right"
        className="dialogue-flow-canvas transition-colors duration-300"
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-md shadow-md border border-amber-200 dark:border-amber-800 z-50 flex items-center">
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