import { useCallback, useMemo } from 'react';
import { LAYOUT_CONSTANTS, NODE_DIMENSIONS } from '../../constants/initialData';

/**
 * Custom hook to handle auto-layout functionality
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {boolean} isHorizontal - Whether layout is horizontal
 * @param {Function} updateNodePositions - Function to update node positions
 * @returns {Function} Function to trigger auto layout
 */
const useAutoLayout = (nodes, edges, isHorizontal, updateNodePositions) => {
  // Extract node relationships from edges
  const nodeRelationships = useMemo(() => {
    const relationships = {};
    
    // Initialize relationships for all nodes
    nodes.forEach(node => {
      relationships[node.id] = {
        children: [],
        parents: [],
        level: -1,
        dimensions: {
          width: NODE_DIMENSIONS.WIDTH,
          height: NODE_DIMENSIONS.HEIGHT
        }
      };
    });
    
    // Fill in relationships based on edges
    edges.forEach(edge => {
      if (relationships[edge.source]) {
        relationships[edge.source].children.push(edge.target);
      }
      
      if (relationships[edge.target]) {
        relationships[edge.target].parents.push(edge.source);
      }
    });
    
    return relationships;
  }, [nodes, edges]);

  // Calculate node levels (depth in the tree)
  const calculateNodeLevels = useCallback(() => {
    const levels = {};
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    // Use first node as root if no root nodes found
    const processedRoots = rootNodes.length > 0 ? rootNodes : [nodes[0]];
    
    // Breadth-first traversal to assign levels
    const queue = processedRoots.map(node => ({
      id: node.id,
      level: 0
    }));
    
    const nodeInfo = { ...nodeRelationships };
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      
      // Skip if node already has higher or equal level
      if (nodeInfo[id].level >= level) continue;
      
      nodeInfo[id].level = level;
      
      // Add this node to its level
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(id);
      
      // Queue all children with incremented level
      nodeInfo[id].children.forEach(childId => {
        if (nodeInfo[childId]) {
          queue.push({
            id: childId,
            level: level + 1
          });
        }
      });
    }
    
    return { levels, nodeInfo };
  }, [nodes, edges, nodeRelationships]);

  // Position nodes horizontally (levels in columns)
  const positionHorizontally = useCallback((levels, nodeInfo) => {
    const {
      INITIAL_X_OFFSET,
      VERTICAL_NODE_DISTANCE,
      HORIZONTAL_LEVEL_DISTANCE
    } = LAYOUT_CONSTANTS;
    
    const positions = {};
    
    // For each level (column)
    Object.keys(levels).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      const levelNodes = levels[level];
      const levelInt = parseInt(level);
      
      // Position nodes vertically within this level
      const totalHeight = levelNodes.reduce((sum, nodeId, index) => {
        if (index === levelNodes.length - 1) return sum;
        return sum + nodeInfo[nodeId].dimensions.height + VERTICAL_NODE_DISTANCE;
      }, 0);
      
      let currentY = 50;
      
      if (levelNodes.length > 1) {
        currentY = 150 - totalHeight / 2;
      }
      
      levelNodes.forEach(nodeId => {
        positions[nodeId] = {
          x: INITIAL_X_OFFSET + levelInt * HORIZONTAL_LEVEL_DISTANCE,
          y: currentY
        };
        
        currentY += nodeInfo[nodeId].dimensions.height + VERTICAL_NODE_DISTANCE;
      });
    });
    
    return positions;
  }, []);

  // Position nodes vertically (levels in rows)
  const positionVertically = useCallback((levels, nodeInfo) => {
    const {
      INITIAL_Y_OFFSET,
      HORIZONTAL_NODE_DISTANCE,
      VERTICAL_LEVEL_DISTANCE
    } = LAYOUT_CONSTANTS;
    
    const positions = {};
    
    // For each level (row)
    Object.keys(levels).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      const levelNodes = levels[level];
      const levelInt = parseInt(level);
      
      // Position nodes horizontally within this level
      const totalWidth = levelNodes.reduce((sum, nodeId, index) => {
        if (index === levelNodes.length - 1) return sum;
        return sum + nodeInfo[nodeId].dimensions.width + HORIZONTAL_NODE_DISTANCE;
      }, 0);
      
      let currentX = 50;
      
      if (levelNodes.length > 1) {
        currentX = 400 - totalWidth / 2;
      }
      
      levelNodes.forEach(nodeId => {
        positions[nodeId] = {
          x: currentX,
          y: INITIAL_Y_OFFSET + levelInt * VERTICAL_LEVEL_DISTANCE
        };
        
        currentX += nodeInfo[nodeId].dimensions.width + HORIZONTAL_NODE_DISTANCE;
      });
    });
    
    return positions;
  }, []);

  // Main auto-layout function
  const autoLayout = useCallback(() => {
    const { levels, nodeInfo } = calculateNodeLevels();
    
    const positions = isHorizontal
      ? positionHorizontally(levels, nodeInfo)
      : positionVertically(levels, nodeInfo);
    
    updateNodePositions(positions);
  }, [
    calculateNodeLevels,
    isHorizontal,
    positionHorizontally,
    positionVertically,
    updateNodePositions
  ]);

  return autoLayout;
};

export default useAutoLayout;