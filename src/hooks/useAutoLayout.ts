// src/hooks/useAutoLayout.ts
import { useCallback } from 'react';
import { DialogueNode, DialogueEdge, NodePositions, UseAutoLayoutReturn } from '../types';
import { calculateDagreLayout, applyOrderingStrategy } from '../utils/dagreLayout';
import { OrderingStrategy } from '../components/Header/OrderSelector';

/**
 * Enhanced version of useAutoLayout hook that uses Dagre for automatic layout
 * 
 * @param nodes - Current nodes in the flow
 * @param edges - Current edges in the flow
 * @param isHorizontal - Whether layout is horizontal (true) or vertical (false)
 * @param orderingStrategy - The strategy for ordering nodes
 * @param updateNodePositions - Callback function to update node positions after calculation
 * @returns Function to trigger auto-layout calculation and application
 */
const useAutoLayout = (
  nodes: DialogueNode[],
  edges: DialogueEdge[],
  isHorizontal: boolean,
  orderingStrategy: OrderingStrategy = 'default',
  updateNodePositions: (positions: NodePositions) => void
): UseAutoLayoutReturn => {
  
  /**
   * Calculate optimal positions for nodes using Dagre layout algorithm
   */
  const calculateNodePositions = useCallback(() => {
    console.log(`[useAutoLayout] Calculating node positions with Dagre. Layout: ${isHorizontal ? 'horizontal' : 'vertical'}, Strategy: ${orderingStrategy}`);
    
    // If there are no nodes, return empty positions
    if (nodes.length === 0) {
      console.log('[useAutoLayout] No nodes to layout');
      return {};
    }
    
    // Use the direction based on isHorizontal
    const direction = isHorizontal ? 'LR' : 'TB';
    
    // Calculate base positions with Dagre
    const basePositions = calculateDagreLayout(nodes, edges, direction);
    
    // Apply any additional ordering strategies
    const finalPositions = applyOrderingStrategy(basePositions, nodes, orderingStrategy);
    
    console.log('[useAutoLayout] Dagre calculated positions:', finalPositions);
    return finalPositions;
  }, [nodes, edges, isHorizontal, orderingStrategy]);
  
  /**
   * Function to trigger layout calculation and update node positions
   */
  const triggerAutoLayout = useCallback(() => {
    console.log('[useAutoLayout] Auto-layout triggered with Dagre');
    
    if (nodes.length === 0) {
      console.log('[useAutoLayout] No nodes to layout');
      return;
    }
    
    const newPositions = calculateNodePositions();
    
    // Ensure updateNodePositions is defined before calling it
    if (typeof updateNodePositions === 'function') {
      updateNodePositions(newPositions);
      console.log('[useAutoLayout] Node positions updated with Dagre layout');
    } else {
      console.error('[useAutoLayout] updateNodePositions is not a function', updateNodePositions);
    }
  }, [nodes, calculateNodePositions, updateNodePositions]);
  
  return triggerAutoLayout;
};

export default useAutoLayout;