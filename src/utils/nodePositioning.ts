// src/utils/nodePositioning.ts
import { NodePositions, DialogueNode, DialogueEdge } from '../types';

// Type for layout options
export type PositioningMode = 'grid' | 'cascade' | 'horizontal' | 'vertical' | 'radial' | 'compact' | 'custom';

interface LayoutOptions {
  spacing?: number;
  gridColumns?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * Calculate node positions based on the specified layout strategy
 * 
 * @param nodes Array of dialogue nodes
 * @param edges Array of edges connecting nodes
 * @param mode Layout mode to apply
 * @param options Layout configuration options
 * @returns Object mapping node IDs to their new positions
 */
export const calculateNodePositions = (
  nodes: DialogueNode[],
  edges: DialogueEdge[],
  mode: PositioningMode,
  options: LayoutOptions = {}
): NodePositions => {
  console.log(`[nodePositioning] Calculating positions for ${nodes.length} nodes using ${mode} layout`);
  
  // Default options
  const {
    spacing = 150,
    gridColumns = 3,
    centerX = 400,
    centerY = 300
  } = options;
  
  // Clone nodes to avoid modifying originals
  const nodesCopy = [...nodes];
  const positions: NodePositions = {};
  
  // Find all root nodes (nodes with no incoming edges)
  const rootNodeIds = findRootNodes(nodes, edges);
  
  // If no root nodes found, use the first node as root
  if (rootNodeIds.length === 0 && nodes.length > 0) {
    rootNodeIds.push(nodes[0].id);
  }
  
  // Apply the selected layout algorithm
  switch (mode) {
    case 'grid':
      positionNodesInGrid(nodesCopy, positions, spacing, gridColumns);
      break;
      
    case 'cascade':
      positionNodesInCascade(nodesCopy, positions, spacing);
      break;
      
    case 'radial':
      positionNodesRadially(nodesCopy, rootNodeIds, edges, positions, centerX, centerY, spacing);
      break;
      
    case 'compact':
      positionNodesCompactly(nodesCopy, edges, positions, spacing);
      break;
      
    case 'vertical':
      positionNodesInLevels(nodesCopy, rootNodeIds, edges, positions, spacing, false);
      break;
      
    case 'horizontal':
    default:
      positionNodesInLevels(nodesCopy, rootNodeIds, edges, positions, spacing, true);
      break;
  }
  
  return positions;
};

/**
 * Find all root nodes in the graph
 */
const findRootNodes = (nodes: DialogueNode[], edges: DialogueEdge[]): string[] => {
  // Create a set of all target nodes
  const targetNodeIds = new Set(edges.map(edge => edge.target));
  
  // Find nodes that are not targets (they're roots)
  return nodes
    .filter(node => !targetNodeIds.has(node.id))
    .map(node => node.id);
};

/**
 * Organize nodes into levels based on their distance from root nodes
 */
const assignNodesToLevels = (
  nodes: DialogueNode[], 
  rootNodeIds: string[], 
  edges: DialogueEdge[]
): Map<string, number> => {
  const nodeLevels = new Map<string, number>();
  
  // Initialize with root nodes at level 0
  rootNodeIds.forEach(id => nodeLevels.set(id, 0));
  
  // Function to find children of a node
  const getChildrenOf = (nodeId: string): string[] => {
    return edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
  };
  
  // Breadth-first traversal to assign levels
  const processLevel = (nodeIds: string[], level: number) => {
    const nextLevelNodes: string[] = [];
    
    for (const nodeId of nodeIds) {
      const children = getChildrenOf(nodeId);
      
      for (const childId of children) {
        // Only process nodes that haven't been assigned a level
        if (!nodeLevels.has(childId)) {
          nodeLevels.set(childId, level);
          nextLevelNodes.push(childId);
        }
      }
    }
    
    // Process the next level if there are nodes
    if (nextLevelNodes.length > 0) {
      processLevel(nextLevelNodes, level + 1);
    }
  };
  
  // Start the traversal from root nodes
  processLevel(rootNodeIds, 1);
  
  // Handle any disconnected nodes (assign them to level 0)
  nodes.forEach(node => {
    if (!nodeLevels.has(node.id)) {
      nodeLevels.set(node.id, 0);
    }
  });
  
  return nodeLevels;
};

/**
 * Position nodes in a grid layout
 */
const positionNodesInGrid = (
  nodes: DialogueNode[],
  positions: NodePositions,
  spacing: number,
  columns: number
) => {
  const nodeWidth = 150; // Assumed width
  const nodeHeight = 60;  // Assumed height
  
  const rowGap = spacing;
  const colGap = spacing;
  
  nodes.forEach((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    positions[node.id] = {
      x: col * (nodeWidth + colGap),
      y: row * (nodeHeight + rowGap)
    };
  });
};

/**
 * Position nodes in a cascading layout
 */
const positionNodesInCascade = (
  nodes: DialogueNode[],
  positions: NodePositions,
  spacing: number
) => {
  const offset = spacing / 2;
  
  nodes.forEach((node, index) => {
    positions[node.id] = {
      x: index * offset,
      y: index * offset
    };
  });
};

/**
 * Position nodes radially around a center point
 */
const positionNodesRadially = (
  nodes: DialogueNode[],
  rootNodeIds: string[],
  edges: DialogueEdge[],
  positions: NodePositions,
  centerX: number,
  centerY: number,
  radius: number
) => {
  // Assign nodes to levels (distance from root)
  const nodeLevels = assignNodesToLevels(nodes, rootNodeIds, edges);
  
  // Group nodes by level
  const levelGroups = new Map<number, string[]>();
  nodeLevels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(nodeId);
  });
  
  // Get max level for calculating radius
  const maxLevel = Math.max(...Array.from(nodeLevels.values()));
  
  // Position each node based on its level and position within level
  levelGroups.forEach((nodeIds, level) => {
    const levelRadius = (level === 0) ? 0 : (level * radius);
    
    nodeIds.forEach((nodeId, indexInLevel) => {
      // Place first level node at center if it's the only one
      if (level === 0 && nodeIds.length === 1) {
        positions[nodeId] = { x: centerX, y: centerY };
        return;
      }
      
      // Calculate angle distribution for nodes in this level
      const angleStep = (2 * Math.PI) / nodeIds.length;
      const angle = indexInLevel * angleStep;
      
      // Calculate position using polar coordinates
      positions[nodeId] = {
        x: centerX + levelRadius * Math.cos(angle),
        y: centerY + levelRadius * Math.sin(angle)
      };
    });
  });
};

/**
 * Position nodes in horizontal or vertical levels based on graph structure
 */
const positionNodesInLevels = (
  nodes: DialogueNode[],
  rootNodeIds: string[],
  edges: DialogueEdge[],
  positions: NodePositions,
  spacing: number,
  isHorizontal: boolean
) => {
  // Assign nodes to levels
  const nodeLevels = assignNodesToLevels(nodes, rootNodeIds, edges);
  
  // Group nodes by level
  const levelGroups = new Map<number, string[]>();
  nodeLevels.forEach((level, nodeId) => {
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(nodeId);
  });
  
  // Position each node based on its level and position within level
  levelGroups.forEach((nodeIds, level) => {
    nodeIds.forEach((nodeId, indexInLevel) => {
      if (isHorizontal) {
        // Horizontal layout (levels go from left to right)
        positions[nodeId] = {
          x: level * spacing,
          y: indexInLevel * spacing
        };
      } else {
        // Vertical layout (levels go from top to bottom)
        positions[nodeId] = {
          x: indexInLevel * spacing,
          y: level * spacing
        };
      }
    });
  });
};

/**
 * Position nodes compactly using force-directed algorithm
 * This is a simplified version - a real implementation would use
 * more sophisticated force-directed layout algorithms
 */
const positionNodesCompactly = (
  nodes: DialogueNode[],
  edges: DialogueEdge[],
  positions: NodePositions,
  spacing: number
) => {
  // Start with a grid layout as initial positions
  positionNodesInGrid(nodes, positions, spacing / 2, Math.ceil(Math.sqrt(nodes.length)));
  
  // A full implementation would run several iterations of force-directed layout
  // For simplicity, we'll stop at the initial positioning
}