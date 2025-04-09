// src/hooks/useDialogueNodes.ts
import { useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
} from 'reactflow';
// Import the types and initial data
import { NodePositions } from '../types';
import { 
  DEFAULT_EMPTY_NODES, 
  DEFAULT_EMPTY_EDGES, 
} from '../constants/initialData';

/**
 * Custom hook to manage a *single* set of dialogue nodes and edges state
 * and basic interactions.
 *
 * WARNING: This hook does NOT support multiple NPCs or conversations.
 * Use `useDialogueManager` for the application structure with the sidebar.
 */
const useDialogueNodes = () => {
  // Use react-flow hooks to manage state for the initial nodes/edges
  // Let TypeScript infer the types from the initial values
  const [nodes, setNodes] = useNodesState(DEFAULT_EMPTY_NODES);
  const [edges, setEdges] = useEdgesState(DEFAULT_EMPTY_EDGES);

  // React Flow's built-in handlers for node/edge changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  /**
   * Handler for connecting nodes (when connection is valid and dropped on a target handle)
   */
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('[useDialogueNodes] onConnect:', params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges],
  );

  /**
   * Updates node positions based on a map of IDs to new positions.
   * Typically used after an auto-layout calculation.
   */
  const updateNodePositions = useCallback(
    (positions: NodePositions) => {
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
   */
  const updateNodeLayout = useCallback(
    (isHorizontal: boolean) => {
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
    [setNodes]
  );

  // Return state, setters, and handlers
  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  };
};

export default useDialogueNodes;