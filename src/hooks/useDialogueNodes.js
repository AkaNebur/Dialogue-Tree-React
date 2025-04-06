import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { initialNodes, initialEdges } from '../constants/initialData';

/**
 * Custom hook to manage dialogue nodes and edges
 * @returns {Object} Nodes, edges, and handlers
 */
const useDialogueNodes = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  /**
   * Handler for connecting nodes
   */
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  /**
   * Updates node positions
   * @param {Object} positions - Map of node IDs to positions
   */
  const updateNodePositions = useCallback(
    (positions) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (positions[node.id]) {
            return {
              ...node,
              position: positions[node.id],
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  /**
   * Updates node source and target positions based on layout
   * @param {boolean} isHorizontal - Whether layout is horizontal
   */
  const updateNodeLayout = useCallback(
    (isHorizontal) => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          sourcePosition: isHorizontal ? 'right' : 'bottom',
          targetPosition: isHorizontal ? 'left' : 'top',
        }))
      );
    },
    [setNodes]
  );

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