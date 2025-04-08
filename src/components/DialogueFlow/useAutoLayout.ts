// src/components/DialogueFlow/useAutoLayout.ts
import { useCallback, useMemo } from 'react';
import { DialogueNode, DialogueEdge, NodeRelationships, NodeLevels, NodePositions, UseAutoLayoutReturn } from '../../types';
import { NODE_DIMENSIONS, LAYOUT_CONSTANTS } from '../../constants/initialData';

/**
 * Custom hook to handle automatic layout calculations for dialogue tree nodes
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
   * Calculate optimal positions for nodes based on their relationships
   */
  const calculateNodePositions = useCallback(() => {
    console.log('[useAutoLayout] Calculating node positions. Horizontal layout:', isHorizontal);
    const positions: NodePositions = {};
    
    // Get constants based on layout direction
    const { 
      HORIZONTAL_LEVEL_DISTANCE, 
      VERTICAL_LEVEL_DISTANCE,
      HORIZONTAL_NODE_DISTANCE,
      VERTICAL_NODE_DISTANCE, 
      INITIAL_X_OFFSET,
      INITIAL_Y_OFFSET
    } = LAYOUT_CONSTANTS;

    // Iterate through each level
    Object.entries(nodeLevels).forEach(([levelStr, nodeIds]) => {
      const level = parseInt(levelStr);
      
      // Calculate position for each node in this level
      nodeIds.forEach((nodeId, index) => {
        // Calculate positions differently based on horizontal/vertical layout
        if (isHorizontal) {
          // In horizontal layout:
          // - Level determines the x-coordinate (levels increase from left to right)
          // - Index in level determines the y-coordinate (nodes ordered from top to bottom)
          positions[nodeId] = {
            x: INITIAL_X_OFFSET + (level - 1) * HORIZONTAL_LEVEL_DISTANCE,
            y: INITIAL_Y_OFFSET + index * VERTICAL_NODE_DISTANCE
          };
        } else {
          // In vertical layout:
          // - Level determines the y-coordinate (levels increase from top to bottom)
          // - Index in level determines the x-coordinate (nodes ordered from left to right)
          positions[nodeId] = {
            x: INITIAL_X_OFFSET + index * HORIZONTAL_NODE_DISTANCE,
            y: INITIAL_Y_OFFSET + (level - 1) * VERTICAL_LEVEL_DISTANCE
          };
        }
      });
    });
    
    console.log('[useAutoLayout] Calculated positions:', positions);
    return positions;
  }, [nodeLevels, isHorizontal]);
  
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
    updateNodePositions(newPositions);
    console.log('[useAutoLayout] Node positions updated');
  }, [nodes, calculateNodePositions, updateNodePositions]);
  
  return triggerAutoLayout;
};

export default useAutoLayout;