// File: src/components/DialogueFlow/index.tsx
import React, { useEffect, memo, useCallback, useRef } from 'react';
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

  const reactFlowInstance = useReactFlow<DialogueNodeType, DialogueEdge>();
  const connectingNode = useRef<ConnectingNodeRef | null>(null);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.6, duration: 400 });
  }, [reactFlowInstance]);

  useEffect(() => {
    if (onFitViewInitialized && reactFlowInstance) {
      onFitViewInitialized(handleFitView);
    }
  }, [handleFitView, onFitViewInitialized, reactFlowInstance]);

  // Add keyboard handler for delete keys (supports multiple names: Delete, Del, Supr)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for any variant of the delete key
      if (event.key === 'Delete' || event.key === 'Del' || event.key === 'Supr') {
        console.log(`Delete key pressed: ${event.key}`);
        
        // Get selected nodes and edges
        const selectedNodes = nodes.filter(node => node.selected);
        const selectedEdges = edges.filter(edge => edge.selected);
        
        // Create change events to delete these nodes/edges
        const nodeChanges: NodeChange[] = selectedNodes.map(node => ({
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
  }, [nodes, edges, onNodesChange, onEdgesChange]);

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
  );
});

DialogueFlow.displayName = 'DialogueFlow';
export default DialogueFlow;