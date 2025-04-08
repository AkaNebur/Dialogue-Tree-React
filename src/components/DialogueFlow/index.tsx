// src/components/DialogueFlow/index.tsx
import React, { useEffect, memo, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  Position,
  Connection,
  OnConnectStartParams,
  NodeTypes,
  OnConnectStart,
  OnConnectEnd,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Internal hook for layout logic
import useAutoLayout from './useAutoLayout';
// Custom node component
import DialogueNode from './DialogueNode';
// Centralized ID generator
import { getNextNodeId } from '../../constants/initialData';
import { DialogueFlowProps, DialogueNode as DialogueNodeType } from '../../types';

// Define node types used in the flow
const nodeTypes: NodeTypes = {
  custom: DialogueNode,
  input: DialogueNode,
};

// Type for the connect reference
interface ConnectingNodeRef {
  nodeId: string;
  handleId: string;
  handleType: string;
}

/**
 * DialogueFlow Component
 * Renders the React Flow canvas and handles interactions for the *active* dialogue.
 */
const DialogueFlow: React.FC<DialogueFlowProps> = memo(({
  nodes,
  edges,
  setNodes,
  setEdges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isHorizontal,
  updateNodePositions,
  onInitialized,
  onFitViewInitialized,
  selectedConversationId,
}) => {
  const reactFlowInstance = useReactFlow();
  const connectingNode = useRef<ConnectingNodeRef | null>(null);
  const initialLayoutRun = useRef<boolean>(false);
  const nodesRef = useRef(nodes);
  const prevConversationIdRef = useRef<string | null>(selectedConversationId);
  const prevIsHorizontalRef = useRef<boolean>(isHorizontal); // Track previous layout direction

  // Initialize the auto-layout hook
  const autoLayout = useAutoLayout(
    nodes,
    edges,
    isHorizontal,
    updateNodePositions
  );

  // Create fitView function that can be passed up to parent
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      console.log("[DialogueFlow] Executing fitView.");
      reactFlowInstance.fitView({
        padding: 0.2,
        duration: 300,
        includeHiddenNodes: false
      });
    } else {
      console.warn("[DialogueFlow] Cannot fitView: reactFlowInstance not available.");
    }
  }, [reactFlowInstance]);

  // --- Effects ---

  // Effect 1: Pass layout function up when it's ready or changes identity.
  useEffect(() => {
    if (onInitialized && typeof autoLayout === 'function') {
      console.log("[DialogueFlow Effect 1] Passing autoLayout function up.");
      onInitialized(autoLayout);
    }
  }, [autoLayout, onInitialized]);

  // Effect for passing fitView function up to parent
  useEffect(() => {
    if (onFitViewInitialized && reactFlowInstance) {
      console.log("[DialogueFlow] Passing fitView function up.");
      onFitViewInitialized(handleFitView);
    }
  }, [handleFitView, onFitViewInitialized, reactFlowInstance]);

  // Effect 1.5: Reset initial layout flag when the selected conversation changes.
  useEffect(() => {
    if (prevConversationIdRef.current !== selectedConversationId) {
        console.log(`[DialogueFlow Effect 1.5] Conversation changed (${prevConversationIdRef.current} -> ${selectedConversationId}), resetting initialLayoutRun flag.`);
        initialLayoutRun.current = false;
        prevConversationIdRef.current = selectedConversationId; // Update the ref
    }
    nodesRef.current = nodes; // Keep track of current nodes ref, might be useful
  }, [selectedConversationId, nodes]);

  // Effect 2: Handle initial layout and layout changes triggered by `isHorizontal`.
  useEffect(() => {
    if (!reactFlowInstance || typeof autoLayout !== 'function' || nodes.length === 0) {
      console.log(`[Layout Effect 2] Skipping: Instance=${!!reactFlowInstance}, LayoutFunc=${typeof autoLayout === 'function'}, Nodes=${nodes.length}`);
      return;
    }

    const conversationJustLoaded = !initialLayoutRun.current; // True if initial layout hasn't run for this conversation
    const layoutDirectionChanged = prevIsHorizontalRef.current !== isHorizontal; // True if layout toggled

    let shouldRunLayout = false;
    if (conversationJustLoaded) {
      shouldRunLayout = true;
      console.log("[Layout Effect 2] Needs INITIAL layout for this conversation.");
    } else if (layoutDirectionChanged) {
      console.log("[Layout Effect 2] Layout direction changed, running layout again.");
      shouldRunLayout = true;
    }

    if (shouldRunLayout) {
      console.log("[Layout Effect 2] Scheduling layout (initial or direction change)...");
      // Use timeout to allow DOM updates before layout
      const layoutTimer = setTimeout(() => {
        console.log("[Layout Effect 2] Executing autoLayout()...");
        autoLayout(); // Execute the layout function

        // Add fitView after layout is applied
        setTimeout(() => {
          handleFitView();
        }, 50);

        // Set flag after layout is applied (since fitView is removed)
        // Only mark as run if it was the initial run for this specific conversation ID
        if (conversationJustLoaded) {
            initialLayoutRun.current = true;
            console.log("[Layout Effect 2] Marked initialLayoutRun as true (after layout).");
        }
        // Update the ref for tracking layout direction changes AFTER this run
        prevIsHorizontalRef.current = isHorizontal;

      }, 50);
      return () => clearTimeout(layoutTimer);
    }
  }, [reactFlowInstance, nodes, isHorizontal, autoLayout, handleFitView]);


  // --- Interaction Handlers ---

  // Called when dragging starts from a handle. Store source info.
  const handleConnectStart: OnConnectStart = useCallback((
    event, 
    params
  ) => {
    connectingNode.current = { 
      nodeId: params.nodeId || '', 
      handleId: params.handleId || '', 
      handleType: params.handleType || '' 
    };
    console.log('[Connect Start] Stored connecting node info:', connectingNode.current);
  }, []);

  // Called when a connection drag ends. Creates node if dropped on pane.
  const handleConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      console.log('[Connect End] Triggered.');
      const connectingInfo = connectingNode.current;

      // Early return if event is not a mouse event
      if (!event || !('clientX' in event) || !('clientY' in event)) {
        console.log('[Connect End] Not a mouse event, ignoring.');
        connectingNode.current = null;
        return;
      }

      // Check if event is defined and has target property
      // TypeScript safely checks if target exists and if it has classList
      const targetElement = event.target as HTMLElement;
      const targetIsPane = targetElement?.classList?.contains('react-flow__pane');

      console.log('[Connect End] Target is pane:', targetIsPane);
      console.log('[Connect End] Connecting node info:', connectingInfo);
      console.log('[Connect End] Instance available:', !!reactFlowInstance);
      console.log('[Connect End] setNodes available:', typeof setNodes === 'function');
      console.log('[Connect End] setEdges available:', typeof setEdges === 'function');

      if (targetIsPane && connectingInfo && reactFlowInstance && setNodes && setEdges) {
        console.log('[Connect End] Conditions met! Creating new node and edge...');

        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        
        // Use actual properties from MouseEvent
        const clientX = event.clientX;
        const clientY = event.clientY;

        // Check if clientX/clientY are valid numbers before proceeding
        if (typeof clientX !== 'number' || typeof clientY !== 'number') {
            console.error('[Connect End] Could not determine drop coordinates.');
            connectingNode.current = null;
            return;
        }

        const position = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
        console.log('[Connect End] Calculated new node position:', position);

        const newNodeId = getNextNodeId();
        const newNode: DialogueNodeType = {
          id: newNodeId,
          type: 'custom',
          position,
          data: {
            label: `New Response ${newNodeId}`,
            className: 'node-more',
          },
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
        };
        console.log('[Connect End] New node object:', newNode);

        const newEdge = {
          id: `e${sourceNodeId}-${newNodeId}`,
          source: sourceNodeId,
          target: newNodeId,
          sourceHandle: sourceHandleId,
        };
        console.log('[Connect End] New edge object:', newEdge);

        console.log('[Connect End] Calling setNodes (via prop)...');
        setNodes((nds) => [...nds, newNode]);
        console.log('[Connect End] Calling setEdges (via prop)...');
        setEdges((eds) => [...eds, newEdge]);
        console.log('[Connect End] State update calls dispatched.');

      } else {
         if (!targetIsPane) console.log('[Connect End] Target was not the pane.');
         if (!connectingInfo) console.log('[Connect End] No connecting node info stored.');
         if (!reactFlowInstance) console.log('[Connect End] ReactFlow instance not available.');
         if (typeof setNodes !== 'function') console.log('[Connect End] setNodes function not available.');
         if (typeof setEdges !== 'function') console.log('[Connect End] setEdges function not available.');
         console.log('[Connect End] Conditions NOT met. Node not created.');
      }

      console.log('[Connect End] Clearing connecting node info.');
      connectingNode.current = null;
    },
    [reactFlowInstance, setNodes, setEdges, isHorizontal]
  );


  // --- Render ---
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
      className="dialogue-flow-canvas bg-gray-50"
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
    >
      <Controls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      <Background color="#aaa" gap={16} variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
});

export default DialogueFlow;