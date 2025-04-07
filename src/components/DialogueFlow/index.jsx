// src/components/DialogueFlow/index.jsx
import React, { useEffect, memo, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Internal hook for layout logic
import useAutoLayout from './useAutoLayout';
// Custom node component
import DialogueNode from './DialogueNode';
// Centralized ID generator
import { getNextNodeId } from '../../constants/initialData';

// Define node types used in the flow
const nodeTypes = {
  custom: DialogueNode,
  input: DialogueNode,
};

/**
 * DialogueFlow Component
 * Renders the React Flow canvas and handles interactions for the *active* dialogue.
 */
const DialogueFlow = memo(({
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
  selectedConversationId, // Receive conversation ID
}) => {
  const reactFlowInstance = useReactFlow();
  const connectingNode = useRef(null);
  const initialLayoutRun = useRef(false);
  const nodesRef = useRef(nodes);
  const prevConversationIdRef = useRef(selectedConversationId);
  const prevIsHorizontalRef = useRef(isHorizontal); // Track previous layout direction

  // Initialize the auto-layout hook
  const autoLayout = useAutoLayout(
    nodes,
    edges,
    isHorizontal,
    updateNodePositions
  );

  // --- Effects ---

  // Effect 1: Pass layout function up when it's ready or changes identity.
  useEffect(() => {
    if (onInitialized && typeof autoLayout === 'function') {
      console.log("[DialogueFlow Effect 1] Passing autoLayout function up.");
      onInitialized(autoLayout);
    }
  }, [autoLayout, onInitialized]); // Only depends on autoLayout function identity and the callback prop

  // Effect 1.5: Reset initial layout flag when the selected conversation changes.
  useEffect(() => {
    if (prevConversationIdRef.current !== selectedConversationId) {
        console.log(`[DialogueFlow Effect 1.5] Conversation changed (${prevConversationIdRef.current} -> ${selectedConversationId}), resetting initialLayoutRun flag.`);
        initialLayoutRun.current = false;
        prevConversationIdRef.current = selectedConversationId; // Update the ref
    }
    nodesRef.current = nodes; // Keep track of current nodes ref, might be useful
  }, [selectedConversationId, nodes]); // Run when conversation ID changes, or nodes array changes (to update nodesRef)

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
    // Dependencies: ReactFlow instance, nodes (layout needs current nodes), layout direction, and the layout function itself.
    // The logic *inside* now prevents unnecessary runs based on nodes/autoLayout ref changes alone after the initial load/direction change.
  }, [reactFlowInstance, nodes, isHorizontal, autoLayout]);


  // --- Interaction Handlers ---

  // Called when dragging starts from a handle. Store source info.
  const handleConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    connectingNode.current = { nodeId, handleId, handleType };
    console.log('[Connect Start] Stored connecting node info:', connectingNode.current);
  }, []);

  // Called when a connection drag ends. Creates node if dropped on pane.
  const handleConnectEnd = useCallback(
    (event) => {
      console.log('[Connect End] Triggered.');
      const connectingInfo = connectingNode.current;

      // Check if event is defined and has target property
      const targetIsPane = event?.target?.classList.contains('react-flow__pane');

      console.log('[Connect End] Target is pane:', targetIsPane);
      console.log('[Connect End] Connecting node info:', connectingInfo);
      console.log('[Connect End] Instance available:', !!reactFlowInstance);
      console.log('[Connect End] setNodes available:', typeof setNodes === 'function');
      console.log('[Connect End] setEdges available:', typeof setEdges === 'function');

      if (targetIsPane && connectingInfo && reactFlowInstance && setNodes && setEdges) {
        console.log('[Connect End] Conditions met! Creating new node and edge...');

        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingInfo;
        // Ensure event is defined before accessing clientX/clientY
        const clientX = event && ('changedTouches' in event ? event.changedTouches[0]?.clientX : event.clientX);
        const clientY = event && ('changedTouches' in event ? event.changedTouches[0]?.clientY : event.clientY);

        // Check if clientX/clientY are valid numbers before proceeding
        if (typeof clientX !== 'number' || typeof clientY !== 'number') {
            console.error('[Connect End] Could not determine drop coordinates.');
            connectingNode.current = null;
            return;
        }


        const position = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
        console.log('[Connect End] Calculated new node position:', position);

        const newNodeId = getNextNodeId();
        const newNode = {
          id: newNodeId,
          type: 'custom',
          position,
          data: {
            label: `New Response ${newNodeId}`,
            className: 'node-more', // <-- Move className inside data
          },
          // className: 'node-more', // Removed from top level
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
    [reactFlowInstance, setNodes, setEdges, isHorizontal] // Added isHorizontal dependency for new node handle positions
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
      // **REMOVED fitView prop**
      // fitView
      // fitViewOptions={{ padding: 0.2, duration: 300 }} // Also remove options if fitView is removed
      attributionPosition="bottom-right"
      className="dialogue-flow-canvas bg-gray-50"
      // Keep viewport static unless user pans/zooms
      defaultViewport={{ x: 0, y: 0, zoom: 1 }} // Optional: Set an initial viewport
      // Prevent zoom/pan if needed (uncomment):
      // zoomOnScroll={false}
      // panOnDrag={false}
      // zoomOnDoubleClick={false}
    >
      <Controls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      <Background color="#aaa" gap={16} variant="dots" />
    </ReactFlow>
  );
});

export default DialogueFlow;