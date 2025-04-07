// hooks/useDialogueNodes.js
import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, Position } from 'reactflow'; // Added Position
import { initialNodes, initialEdges } from '../constants/initialData';

// Track the node ID counter - Make it exportable
let nodeId = 100; // Start from a higher number to avoid conflicts with initial nodes
export const getNextNodeId = () => `${nodeId++}`; // Export the helper function

/**
 * Custom hook to manage dialogue nodes and edges state and basic interactions.
 * The logic for adding nodes on edge drop is now handled within the
 * component where useReactFlow() is available (DialogueFlow.jsx).
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  /**
   * Handler for connecting nodes (when connection is valid and dropped on a target handle)
   */
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // --- createOnConnectEnd factory function has been removed ---
  // The actual onConnectEnd logic now resides in DialogueFlow.jsx
  // where it has access to the reactFlowInstance via useReactFlow()

  /**
   * Updates node positions based on a map of IDs to new positions.
   * Typically used after an auto-layout calculation.
   * @param {Object.<string, {x: number, y: number}>} positions - Map of node IDs to positions.
   */
  const updateNodePositions = useCallback(
    (positions) => {
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
    onNodesChange,
    onEdgesChange,
    onConnect,
    // onConnectEnd handler is now managed in the component using useReactFlow
    updateNodePositions,
    updateNodeLayout,
  };
};

export default useDialogueNodes;