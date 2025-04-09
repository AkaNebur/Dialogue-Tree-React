// src/hooks/useNodeOrdering.ts
import { useState, useCallback } from 'react';
import { DialogueNode, NodeLevels, NodeRelationships, NodePositions } from '../types';
import { LAYOUT_CONSTANTS } from '../constants/initialData';

export type OrderingStrategy = 'default' | 'alphabetical' | 'reverse' | 'compact' | 'shuffle';

interface UseNodeOrderingReturn {
  orderingStrategy: OrderingStrategy;
  changeOrderingStrategy: (strategy: OrderingStrategy) => void;
  applyNodeOrdering: (
    nodes: DialogueNode[], 
    nodeLevels: NodeLevels, 
    nodeRelationships: NodeRelationships,
    isHorizontal: boolean
  ) => NodePositions;
}

/**
 * Custom hook to manage node ordering strategies
 * 
 * @returns Current ordering strategy and function to change it
 */
const useNodeOrdering = (): UseNodeOrderingReturn => {
  const [orderingStrategy, setOrderingStrategy] = useState<OrderingStrategy>('default');

  const changeOrderingStrategy = useCallback((strategy: OrderingStrategy) => {
    setOrderingStrategy(strategy);
  }, []);

  /**
   * Apply the selected ordering strategy to calculate node positions
   */
  const applyNodeOrdering = useCallback((
    nodes: DialogueNode[],
    nodeLevels: NodeLevels,
    nodeRelationships: NodeRelationships,
    isHorizontal: boolean
  ): NodePositions => {
    const { 
      HORIZONTAL_LEVEL_DISTANCE, 
      VERTICAL_LEVEL_DISTANCE,
      HORIZONTAL_NODE_DISTANCE,
      VERTICAL_NODE_DISTANCE, 
      INITIAL_X_OFFSET,
      INITIAL_Y_OFFSET
    } = LAYOUT_CONSTANTS;

    const positions: NodePositions = {};

    // Helper function to get node display label (used for alphabetical sorting)
    const getNodeLabel = (nodeId: string): string => {
      const node = nodes.find(n => n.id === nodeId);
      return node?.data?.label || nodeId;
    };

    // Process each level based on the selected ordering strategy
    Object.entries(nodeLevels).forEach(([levelStr, nodeIds]) => {
      const level = parseInt(levelStr);
      let orderedNodeIds = [...nodeIds]; // Clone the array to avoid modifying the original

      // Apply the selected ordering strategy
      switch (orderingStrategy) {
        case 'alphabetical':
          // Sort nodes alphabetically by their labels
          orderedNodeIds.sort((a, b) => getNodeLabel(a).localeCompare(getNodeLabel(b)));
          break;
          
        case 'reverse':
          // Reverse the current order at this level
          orderedNodeIds.reverse();
          break;
          
        case 'compact':
          // Try to position child nodes near their parents (complex logic)
          // For simplicity, we'll just adjust the spacing here
          break;
          
        case 'shuffle':
          // Randomly shuffle nodes at this level
          for (let i = orderedNodeIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [orderedNodeIds[i], orderedNodeIds[j]] = [orderedNodeIds[j], orderedNodeIds[i]];
          }
          break;
          
        case 'default':
        default:
          // Keep the default order
          break;
      }
      
      // Calculate positions based on the ordered node IDs
      orderedNodeIds.forEach((nodeId, index) => {
        if (isHorizontal) {
          // Horizontal layout: Levels increase from left to right
          positions[nodeId] = {
            x: INITIAL_X_OFFSET + (level - 1) * HORIZONTAL_LEVEL_DISTANCE,
            y: INITIAL_Y_OFFSET + index * VERTICAL_NODE_DISTANCE
          };
        } else {
          // Vertical layout: Levels increase from top to bottom
          positions[nodeId] = {
            x: INITIAL_X_OFFSET + index * HORIZONTAL_NODE_DISTANCE,
            y: INITIAL_Y_OFFSET + (level - 1) * VERTICAL_LEVEL_DISTANCE
          };
        }
      });
    });

    return positions;
  }, [orderingStrategy]);

  return {
    orderingStrategy,
    changeOrderingStrategy,
    applyNodeOrdering
  };
};

export default useNodeOrdering;