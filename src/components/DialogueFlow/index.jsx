// components/DialogueFlow/index.jsx
import React, { useEffect, memo, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ... other imports ...
import useAutoLayout from './useAutoLayout';
import DialogueNode from './DialogueNode';
import { getNextNodeId } from '../../hooks/useDialogueNodes';

const nodeTypes = {
  custom: DialogueNode,
};

const DialogueFlow = ({
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
}) => {
  const reactFlowInstance = useReactFlow();
  const connectingNode = useRef(null);
  const initialLayoutRun = useRef(false);

  const autoLayout = useAutoLayout(
    nodes,
    edges,
    isHorizontal,
    updateNodePositions
  );

  // --- Effects ---

  // Pass autoLayout up
  useEffect(() => {
    if (onInitialized && typeof autoLayout === 'function') {
      onInitialized(autoLayout);
    }
  }, [autoLayout, onInitialized]);

  // CORRECTED Effect for Initial Layout and Layout Toggling
  useEffect(() => {
    if (!reactFlowInstance) return;
    const currentAutoLayout = autoLayout;
    if (typeof currentAutoLayout !== 'function') return;

    let shouldRunLayout = false;
    if (!initialLayoutRun.current) {
      shouldRunLayout = true;
      console.log("[Layout Effect] Running INITIAL layout/fitView."); // Log
    } else {
      // This block will run if isHorizontal changes AFTER initial load
      shouldRunLayout = true; // Assume isHorizontal change triggered it
      console.log("[Layout Effect] Running layout/fitView due to isHorizontal change."); // Log
    }

    if (shouldRunLayout) {
      const layoutTimer = setTimeout(() => {
        console.log("[Layout Effect] Executing currentAutoLayout()..."); // Log
        currentAutoLayout();
        const fitViewTimer = setTimeout(() => {
          console.log("[Layout Effect] Executing fitView()..."); // Log
          reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
          if (!initialLayoutRun.current) {
            initialLayoutRun.current = true;
          }
        }, 50);
        return () => clearTimeout(fitViewTimer);
      }, 100);
      return () => clearTimeout(layoutTimer);
    }
  // Dependencies: isHorizontal, reactFlowInstance. Correctly excludes autoLayout.
  }, [isHorizontal, reactFlowInstance]);


  // --- Interaction Handlers ---

  const handleConnectStart = useCallback((event, { nodeId, handleId, handleType }) => {
    connectingNode.current = { nodeId, handleId, handleType };
    // --- DEBUG LOG ---
    console.log('[Connect Start] Set connectingNode.current:', connectingNode.current);
  }, []); // No dependencies needed here

  const handleConnect = useCallback(
    (params) => {
      // --- DEBUG LOG ---
      console.log('[Connect Success] Connection successful:', params);
      onConnect(params); // Call original onConnect from props
      console.log('[Connect Success] Clearing connectingNode.current');
      connectingNode.current = null; // Clear ref on success
    },
    [onConnect] // Depends only on the onConnect function prop
  );

  const handleConnectEnd = useCallback(
    (event) => {
      // --- DEBUG LOG ---
      console.log('[Connect End] Triggered.');

      const targetIsPane = event.target?.classList.contains('react-flow__pane');
      // --- DEBUG LOGS ---
      console.log('[Connect End] Target is pane:', targetIsPane);
      console.log('[Connect End] connectingNode.current before check:', connectingNode.current);
      console.log('[Connect End] reactFlowInstance available:', !!reactFlowInstance);

      // Check if conditions are met to add a node
      if (targetIsPane && connectingNode.current && reactFlowInstance) {
        // --- DEBUG LOG ---
        console.log('[Connect End] Conditions met! Creating node...');

        const { nodeId: sourceNodeId, handleId: sourceHandleId } = connectingNode.current;

        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const position = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
        console.log('[Connect End] Calculated position:', position); // Log position

        const newNodeId = getNextNodeId();
        const newNode = {
          id: newNodeId, type: 'custom', position,
          data: { label: `New Response ${newNodeId}` },
          className: 'node-more',
          sourcePosition: isHorizontal ? 'right' : 'bottom',
          targetPosition: isHorizontal ? 'left' : 'top',
        };
        console.log('[Connect End] New node:', newNode); // Log new node object

        const newEdge = {
          id: `e${sourceNodeId}-${newNodeId}`, source: sourceNodeId, target: newNodeId, sourceHandle: sourceHandleId,
        };
        console.log('[Connect End] New edge:', newEdge); // Log new edge object

        // --- DEBUG LOG ---
        console.log('[Connect End] Calling setNodes...');
        setNodes((nds) => [...nds, newNode]);
        console.log('[Connect End] Calling setEdges...');
        setEdges((eds) => [...eds, newEdge]);
        console.log('[Connect End] State updates called.');

      } else {
        // --- DEBUG LOG ---
        console.log('[Connect End] Conditions NOT met. Node not created.');
      }

      // --- DEBUG LOG ---
      console.log('[Connect End] Clearing connectingNode.current');
      connectingNode.current = null; // ALWAYS clear ref at the end
    },
    // Dependencies are crucial: Include everything from outside the callback that it uses.
    [reactFlowInstance, setNodes, setEdges, isHorizontal /* Add any other external vars if used */]
  );


  // --- Render ---
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={handleConnectStart} // Ensure this is passed
      onConnect={handleConnect}           // Ensure this is passed
      onConnectEnd={handleConnectEnd}     // Ensure this is passed
      nodeTypes={nodeTypes}
      attributionPosition="bottom-right"
      className="dialogue-flow-canvas bg-gray-50"
    >
      <Controls />
      <MiniMap nodeStrokeWidth={3} zoomable pannable />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export default memo(DialogueFlow);