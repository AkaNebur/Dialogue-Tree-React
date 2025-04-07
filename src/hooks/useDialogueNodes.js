// src/hooks/useDialogueNodes.js
import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Position, // Added Position
  applyNodeChanges, // Needed if you use the returned onNodesChange directly
  applyEdgeChanges, // Needed if you use the returned onEdgesChange directly
} from 'reactflow';
// Import the original initial data - this hook doesn't know about NPCs/multiple conversations
import { initialNodes, initialEdges } from '../constants/initialData';

// Track the node ID counter locally within this hook's scope (as it was before)
// Note: This is separate from the ID generator now in initialData.js
let nodeId = 100; // Start from a higher number to avoid conflicts with initial nodes
export const getNextNodeId = () => `${nodeId++}`; // Export the helper function

/**
 * Custom hook to manage a *single* set of dialogue nodes and edges state
 * and basic interactions.
 *
 * WARNING: This hook does NOT support multiple NPCs or conversations.
 * Use `useDialogueManager` for the application structure with the sidebar.
 * The logic for adding nodes on edge drop needs useReactFlow() and is
 * typically handled in the component (like DialogueFlow.jsx).
 *
 * @returns {Object} An object containing:
 *  - nodes: The current nodes array.
 *  - edges: The current edges array.
 *  - setNodes: Function to update the nodes state.
 *  - setEdges: Function to update the edges state.
 *  - onNodesChange: React Flow handler for node changes.
 *  - onEdgesChange: React Flow handler for edge changes.
 *  - onConnect: React Flow handler for successful connections.
 *  - updateNodePositions: Function to update positions from auto-layout.
 *  - updateNodeLayout: Function to update handle positions based on layout direction.
 */
const useDialogueNodes = () => {
  // Use react-flow hooks to manage state for the initial nodes/edges
  const [nodes, setNodes, onNodesChangeDirect] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeDirect] = useEdgesState(initialEdges);

  // React Flow's built-in handlers for node/edge changes
  // These are often passed directly to ReactFlow component
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );


  /**
   * Handler for connecting nodes (when connection is valid and dropped on a target handle)
   */
  const onConnect = useCallback(
    (params) => {
      console.log('[useDialogueNodes] onConnect:', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  /**
   * Updates node positions based on a map of IDs to new positions.
   * Typically used after an auto-layout calculation.
   * @param {Object.<string, {x: number, y: number}>} positions - Map of node IDs to positions.
   */
  const updateNodePositions = useCallback(
    (positions) => {
      console.log('[useDialogueNodes] Updating positions:', positions);
      setNodes((nds) =>
        nds.map((node) => {
          // Only update if a new position is provided for this node
          if (positions[node.id]) {
            return {
              ...node,
              // Ensure the position object is correctly structured
              position: { x: positions[node.id].x, y: positions[node.id].y },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  /**
   * Updates the source and target handle positions on all nodes based on layout direction.
   * @param {boolean} isHorizontal - True for horizontal layout, false for vertical.
   */
  const updateNodeLayout = useCallback(
    (isHorizontal) => {
      console.log('[useDialogueNodes] Updating layout direction, isHorizontal:', isHorizontal);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          // Update handle positions for layout change
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
        }))
      );
    },
    [setNodes] // Dependency: setNodes function
  );

  // Return state, setters, and handlers
  return {
    nodes,
    edges,
    setNodes, // Expose setNodes for external updates (like adding nodes)
    setEdges, // Expose setEdges for external updates (like adding edges)
    onNodesChange, // Use the wrapped handler
    onEdgesChange, // Use the wrapped handler
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  };
};

export default useDialogueNodes;