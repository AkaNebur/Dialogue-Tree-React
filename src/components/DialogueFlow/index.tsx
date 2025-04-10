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
} from 'reactflow';
import 'reactflow/dist/style.css';

import DialogueNode from './DialogueNode';
import { useFlowData } from '../../store/dialogueStore';
import { getNextNodeId } from '../../constants/initialData';
import { DialogueNode as DialogueNodeType, DialogueEdge } from '../../types';

const nodeTypes: NodeTypes = {
  custom: DialogueNode,
  input: DialogueNode,
};

interface ConnectingNodeRef {
  nodeId: string;
  handleId: string;
  handleType: string;
}

interface DialogueFlowProps {
    isHorizontal: boolean;
    onFitViewInitialized: (fitViewFn: () => void) => void;
}

const DialogueFlow: React.FC<DialogueFlowProps> = memo(({
  isHorizontal,
  onFitViewInitialized,
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
      connectingNode.current = null; // Clear ref immediately

      if (!event || !('clientX' in event) || !('clientY' in event) || !connectingInfo || !reactFlowInstance) {
        return;
      }

      const targetElement = event.target as HTMLElement;
      const targetIsPane = targetElement?.classList?.contains('react-flow__pane');

      if (targetIsPane && reactFlowInstance.screenToFlowPosition && setNodes && setEdges) {
        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });

        const newNodeId = getNextNodeId();
        const newNode: DialogueNodeType = {
          id: newNodeId,
          type: 'custom',
          position,
          data: { label: `New Response ${newNodeId}`, className: 'node-more' },
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
    [reactFlowInstance, setNodes, setEdges, isHorizontal] // Include store actions and prop
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