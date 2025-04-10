// src/hooks/useAutoLayout.ts
import { useCallback } from 'react';
import { DialogueNode, DialogueEdge, NodePositions, UseAutoLayoutReturn } from '../types';
import { calculateDagreLayout } from '../utils/dagreLayout';

/**
 * Hook that provides a function to trigger Dagre-based auto-layout.
 *
 * @param nodes - Current nodes in the flow
 * @param edges - Current edges in the flow
 * @param isHorizontal - Whether layout is horizontal (true) or vertical (false)
 * @param updateNodePositions - Callback function to update node positions after calculation
 * @returns Function to trigger auto-layout calculation and application
 */
const useAutoLayout = (
  nodes: DialogueNode[],
  edges: DialogueEdge[],
  isHorizontal: boolean,
  updateNodePositions: (positions: NodePositions) => void
): UseAutoLayoutReturn => {

  /**
   * Calculate optimal positions for nodes using Dagre layout algorithm
   */
  const calculateNodePositions = useCallback((): NodePositions => {
    if (nodes.length === 0) {
      return {};
    }
    const direction = isHorizontal ? 'LR' : 'TB';
    return calculateDagreLayout(nodes, edges, direction);
  }, [nodes, edges, isHorizontal]);

  /**
   * Function to trigger layout calculation and update node positions
   */
  const triggerAutoLayout = useCallback(() => {
    if (nodes.length === 0) {
      return;
    }
    const newPositions: NodePositions = calculateNodePositions();
    if (typeof updateNodePositions === 'function') {
      updateNodePositions(newPositions);
    } else {
      console.error('[useAutoLayout] updateNodePositions is not a function', updateNodePositions);
    }
  }, [nodes.length, calculateNodePositions, updateNodePositions]);

  return triggerAutoLayout;
};

export default useAutoLayout;