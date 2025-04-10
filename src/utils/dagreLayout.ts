// src/utils/dagreLayout.ts
import dagre from '@dagrejs/dagre';
import { DialogueNode, DialogueEdge, NodePositions } from '../types';
import { NODE_DIMENSIONS } from '../constants/initialData';

// Create a new directed graph instance for each layout calculation
// Avoids potential state issues with a single global instance
const createGraph = () => new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

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
  nodePadding = 150 // Increased default padding
): NodePositions => {
  const dagreGraph = createGraph();

  // Set graph options
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodePadding, // Horizontal spacing between nodes in the same rank (for TB)
    ranksep: nodePadding * 1.2, // Vertical spacing between ranks (for TB)
    edgesep: nodePadding / 4, // Minimum spacing between edges
    marginx: 50, // Margin on the x-axis
    marginy: 50  // Margin on the y-axis
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
    // Ensure source and target nodes exist in the graph before setting edge
    if (dagreGraph.hasNode(edge.source) && dagreGraph.hasNode(edge.target)) {
       dagreGraph.setEdge(edge.source, edge.target);
    } else {
        console.warn(`Dagre: Skipping edge ${edge.id} because source (${edge.source}) or target (${edge.target}) node not found.`);
    }
  });

  // Calculate the layout
  try {
    dagre.layout(dagreGraph);
  } catch (e) {
    console.error("Dagre layout calculation failed:", e);
    // Return empty positions or current positions if layout fails
    return {};
  }


  // Create the positions object
  const positions: NodePositions = {};

  // Extract positions from the Dagre graph
  nodes.forEach(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Skip if node doesn't exist in the graph (shouldn't happen if added correctly)
    if (!nodeWithPosition) {
        console.warn(`Dagre: Node ${node.id} not found in graph after layout.`);
        return;
    }

    // Dagre positions nodes at their center, but React Flow positions them at the top-left
    // So we need to adjust by half the width and height
    positions[node.id] = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2
    };
  });

  return positions;
};

// applyOrderingStrategy function has been removed