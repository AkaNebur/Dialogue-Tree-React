// src/utils/dagreLayout.ts
import dagre from '@dagrejs/dagre';
import { DialogueNode, DialogueEdge, NodePositions } from '../types';
import { NODE_DIMENSIONS } from '../constants/initialData';

// Create a new directed graph
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

/**
 * Calculates node positions using the Dagre layout algorithm
 * 
 * @param nodes - The nodes to layout
 * @param edges - The edges between nodes 
 * @param direction - 'TB' (top to bottom) or 'LR' (left to right)
 * @param nodePadding - Optional spacing between nodes
 * @returns NodePositions object mapping node IDs to positions
 */
export const calculateDagreLayout = (
  nodes: DialogueNode[],
  edges: DialogueEdge[],
  direction: 'TB' | 'LR' = 'TB',
  nodePadding = 50
): NodePositions => {
  // Clear the graph before we start
  dagreGraph.setGraph({});
  
  // Create a new graph
  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: nodePadding, // Horizontal spacing between nodes
    ranksep: nodePadding * 1.5, // Vertical spacing between ranks
    edgesep: 10,          // Spacing between edges
    marginx: 20,          // Margin on the x-axis
    marginy: 20           // Margin on the y-axis
  });
  
  // Default node dimensions from constants
  const nodeWidth = NODE_DIMENSIONS.WIDTH;
  const nodeHeight = NODE_DIMENSIONS.HEIGHT;
  
  // Add nodes to the graph with their dimensions
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { 
      width: nodeWidth, 
      height: nodeHeight 
    });
  });
  
  // Add edges to the graph
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  
  // Calculate the layout
  dagre.layout(dagreGraph);
  
  // Create the positions object
  const positions: NodePositions = {};
  
  // Extract positions from the Dagre graph
  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Skip if node doesn't exist in the graph
    if (!nodeWithPosition) return;
    
    // Dagre positions nodes at their center, but React Flow positions them at the top-left
    // So we need to adjust by half the width and height
    positions[node.id] = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2
    };
  });
  
  return positions;
};

/**
 * Apply additional ordering strategies to Dagre-calculated positions
 * 
 * @param positions - The positions calculated by Dagre
 * @param nodes - The original nodes
 * @param strategy - The ordering strategy to apply
 * @returns Updated node positions
 */
export const applyOrderingStrategy = (
  positions: NodePositions,
  nodes: DialogueNode[],
  strategy: string
): NodePositions => {
  // For most strategies, Dagre's layout is sufficient
  // But we can add custom modifications for specific strategies
  
  if (strategy === 'alphabetical') {
    // We could sort nodes within same rank by label
    // This would require more complex rank detection
  } else if (strategy === 'compact') {
    // Dagre already creates compact layouts, but we could add
    // additional compacting logic here if needed
  } else if (strategy === 'shuffle') {
    // Add small random offsets to positions for a more organic look
    const shuffledPositions = {...positions};
    Object.keys(shuffledPositions).forEach(nodeId => {
      const jitterAmount = 15; // Small amount of randomness
      shuffledPositions[nodeId] = {
        x: shuffledPositions[nodeId].x + (Math.random() - 0.5) * jitterAmount,
        y: shuffledPositions[nodeId].y + (Math.random() - 0.5) * jitterAmount
      };
    });
    return shuffledPositions;
  }
  
  // Default: return the original Dagre positions
  return positions;
};