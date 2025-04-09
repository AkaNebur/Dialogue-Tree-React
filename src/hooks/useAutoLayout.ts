// src/hooks/useAutoLayout.ts
import { useCallback, useMemo } from 'react';
import { DialogueNode, DialogueEdge, NodeRelationships, NodeLevels, NodePositions, UseAutoLayoutReturn } from '../types';
import { NODE_DIMENSIONS, LAYOUT_CONSTANTS } from '../constants/initialData';
import { OrderingStrategy } from '../components/Header/OrderSelector';

/**
 * Enhanced version of useAutoLayout hook that supports different node ordering strategies
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
   * Analyze node relationships (parents, children, levels)
   */
  const nodeRelationships = useMemo(() => {
    console.log('[useAutoLayout] Analyzing node relationships...');
    const relationships: NodeRelationships = {};
    
    // Initialize all nodes with empty relationships
    nodes.forEach(node => {
      relationships[node.id] = {
        children: [],
        parents: [],
        level: 0, // Will be calculated later
        dimensions: {
          width: NODE_DIMENSIONS.WIDTH,
          height: NODE_DIMENSIONS.HEIGHT
        }
      };
    });
    
    // Process all edges to build parent-child relationships
    edges.forEach(edge => {
      const sourceId = edge.source;
      const targetId = edge.target;
      
      // Add this target as a child of the source
      if (relationships[sourceId]) {
        relationships[sourceId].children.push(targetId);
      }
      
      // Add this source as a parent of the target
      if (relationships[targetId]) {
        relationships[targetId].parents.push(sourceId);
      }
    });
    
    // Find all root nodes (nodes without parents)
    const rootNodes = nodes
      .filter(node => !relationships[node.id].parents.length)
      .map(node => node.id);
    
    // Assign levels through breadth-first traversal
    const assignLevels = (nodeIds: string[], level: number) => {
      const nextLevel: string[] = [];
      
      nodeIds.forEach(nodeId => {
        // Set level for this node
        if (relationships[nodeId]) {
          relationships[nodeId].level = level;
          
          // Add children to the next level batch
          relationships[nodeId].children.forEach(childId => {
            // Only process each child once by checking if its level is still default
            if (relationships[childId] && relationships[childId].level === 0 && childId !== nodeId) {
              nextLevel.push(childId);
            }
          });
        }
      });
      
      // Process next level if there are nodes
      if (nextLevel.length > 0) {
        assignLevels(nextLevel, level + 1);
      }
    };
    
    // Start level assignment from root nodes at level 1
    assignLevels(rootNodes, 1);
    
    // Any remaining nodes with level 0 may be in cycles - assign them to level 1
    nodes.forEach(node => {
      if (relationships[node.id]?.level === 0) {
        relationships[node.id].level = 1;
      }
    });
    
    console.log('[useAutoLayout] Node relationships calculated:', relationships);
    return relationships;
  }, [nodes, edges]);
  
  /**
   * Organize nodes by their calculated levels
   */
  const nodeLevels = useMemo(() => {
    console.log('[useAutoLayout] Organizing nodes by levels...');
    const levels: NodeLevels = {};
    
    // Group nodes by their level
    Object.entries(nodeRelationships).forEach(([nodeId, relationship]) => {
      const { level } = relationship;
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(nodeId);
    });
    
    console.log('[useAutoLayout] Node levels:', levels);
    return levels;
  }, [nodeRelationships]);
  
  /**
   * Helper function to get node label (for sorting)
   */
  const getNodeLabel = useCallback((nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.data?.label || nodeId;
  }, [nodes]);
  
  /**
   * Apply the selected ordering strategy to nodes at each level
   */
  const getOrderedNodeIds = useCallback((nodeIds: string[], strategy: OrderingStrategy): string[] => {
    const orderedIds = [...nodeIds]; // Clone to avoid modifying original
    
    switch (strategy) {
      case 'alphabetical':
        // Sort nodes alphabetically by their labels
        orderedIds.sort((a, b) => getNodeLabel(a).localeCompare(getNodeLabel(b)));
        break;
        
      case 'reverse':
        // Reverse the current order at this level
        orderedIds.reverse();
        break;
        
      case 'compact':
        // Try to minimize the overall edge length
        // This is complex, for now just apply a subtle adjustment
        break;
        
      case 'shuffle':
        // Randomly shuffle nodes at this level
        for (let i = orderedIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [orderedIds[i], orderedIds[j]] = [orderedIds[j], orderedIds[i]];
        }
        break;
        
      case 'default':
      default:
        // Keep the default order
        break;
    }
    
    return orderedIds;
  }, [getNodeLabel]);
  
  /**
   * Calculate optimal positions for nodes based on their relationships and ordering strategy
   */
  const calculateNodePositions = useCallback(() => {
    console.log(`[useAutoLayout] Calculating node positions. Ordering strategy: ${orderingStrategy}`);
    const positions: NodePositions = {};
    
    // Get constants from layout constants
    const { 
      HORIZONTAL_LEVEL_DISTANCE, 
      VERTICAL_LEVEL_DISTANCE,
      HORIZONTAL_NODE_DISTANCE,
      VERTICAL_NODE_DISTANCE, 
      INITIAL_X_OFFSET,
      INITIAL_Y_OFFSET
    } = LAYOUT_CONSTANTS;

    // Process each level with the selected ordering strategy
    Object.entries(nodeLevels).forEach(([levelStr, nodeIds]) => {
      const level = parseInt(levelStr);
      const orderedNodeIds = getOrderedNodeIds(nodeIds, orderingStrategy);
      
      // Calculate positions based on horizontal/vertical layout
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
    
    console.log('[useAutoLayout] Calculated positions:', positions);
    return positions;
  }, [nodeLevels, orderingStrategy, isHorizontal, getOrderedNodeIds]);
  
  /**
   * Function to trigger layout calculation and update node positions
   */
  const triggerAutoLayout = useCallback(() => {
    console.log('[useAutoLayout] Auto-layout triggered');
    
    if (nodes.length === 0) {
      console.log('[useAutoLayout] No nodes to layout');
      return;
    }
    
    const newPositions = calculateNodePositions();
    
    // Ensure updateNodePositions is defined before calling it
    if (typeof updateNodePositions === 'function') {
      updateNodePositions(newPositions);
      console.log('[useAutoLayout] Node positions updated');
    } else {
      console.error('[useAutoLayout] updateNodePositions is not a function', updateNodePositions);
    }
  }, [nodes, calculateNodePositions, updateNodePositions]);
  
  return triggerAutoLayout;
};

export default useAutoLayout;