// src/components/DialogueFlow/useAutoLayout.js
import { useCallback, useMemo } from 'react';
// Assuming these constants are correctly defined in initialData.js
import { LAYOUT_CONSTANTS, NODE_DIMENSIONS } from '../../constants/initialData';

/**
 * Custom hook to handle auto-layout functionality for React Flow nodes.
 * Calculates node positions based on a tree structure derived from edges.
 *
 * @param {Array} nodes - The current array of React Flow nodes.
 * @param {Array} edges - The current array of React Flow edges.
 * @param {boolean} isHorizontal - Determines layout direction (true: horizontal, false: vertical).
 * @param {Function} updateNodePositions - Callback function to apply the calculated positions to the nodes state.
 * @returns {Function} A memoized function (`autoLayout`) that triggers the layout calculation and update.
 */
const useAutoLayout = (nodes, edges, isHorizontal, updateNodePositions) => {

  // Memoize the calculation of node relationships (parents, children, dimensions)
  // This recalculates only when nodes or edges change.
  const nodeRelationships = useMemo(() => {
    console.log("[useAutoLayout] Recalculating nodeRelationships..."); // Add log
    const relationships = {};

    // Initialize relationships structure for all nodes
    nodes.forEach(node => {
      relationships[node.id] = {
        children: [],
        parents: [],
        level: -1, // Initialize level, will be calculated later
        // Assume constant dimensions for simplicity, or get from node data if variable
        dimensions: {
          width: NODE_DIMENSIONS.WIDTH,
          height: NODE_DIMENSIONS.HEIGHT
        }
      };
    });

    // Populate children and parents based on edges
    edges.forEach(edge => {
      if (relationships[edge.source]) {
        relationships[edge.source].children.push(edge.target);
      }
      if (relationships[edge.target]) {
        relationships[edge.target].parents.push(edge.source);
      }
    });

    return relationships;
  }, [nodes, edges]); // Dependencies: nodes and edges arrays

  // Memoize the function to calculate node levels (depth) using BFS
  // This function's identity changes only when nodes, edges, or nodeRelationships change.
  const calculateNodeLevels = useCallback(() => {
    console.log("[useAutoLayout] Recalculating node levels..."); // Add log
    const levels = {}; // Stores nodes per level: { 0: [id1, id2], 1: [id3], ... }
    const nodeInfo = JSON.parse(JSON.stringify(nodeRelationships)); // Deep copy to modify levels

    // Identify root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter(node =>
        !edges.some(edge => edge.target === node.id) && nodeInfo[node.id] // Ensure node exists in info
    );

    // Use identified roots, or fallback to the first node if none found (handles single node case)
    const rootsToProcess = rootNodes.length > 0 ? rootNodes : (nodes.length > 0 ? [nodes[0]] : []);

    // BFS queue: stores { id, level }
    const queue = rootsToProcess.map(node => ({ id: node.id, level: 0 }));

    const visited = new Set(); // Keep track of visited nodes during BFS to handle cycles (though ideally trees)

    while (queue.length > 0) {
      const { id, level } = queue.shift();

      // Skip if node doesn't exist in info or already visited with a potentially lower level path
      if (!nodeInfo[id] || visited.has(id) ) { // Removed check: nodeInfo[id].level >= level
         continue;
      }

      visited.add(id);
      nodeInfo[id].level = level; // Assign level

      // Add node to the corresponding level array
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(id);

      // Add children to the queue for the next level
      nodeInfo[id].children.forEach(childId => {
        if (nodeInfo[childId] && !visited.has(childId)) { // Ensure child exists and not visited
          queue.push({
            id: childId,
            level: level + 1
          });
        } else if (!nodeInfo[childId]) {
            console.warn(`[useAutoLayout] Child node ${childId} referenced by edge from ${id} not found in nodes array.`);
        }
      });
    }

     // Handle nodes potentially missed by BFS (e.g., disconnected components or cycle issues)
     nodes.forEach(node => {
       if (nodeInfo[node.id] && nodeInfo[node.id].level === -1) {
         console.warn(`[useAutoLayout] Node ${node.id} was not reached by BFS, assigning level 0.`);
         nodeInfo[node.id].level = 0;
         if (!levels[0]) levels[0] = [];
         if (!levels[0].includes(node.id)) levels[0].push(node.id);
       }
     });


    return { levels, nodeInfo };
  }, [nodes, edges, nodeRelationships]); // Dependencies: recalculate if these change

  // Memoize the horizontal positioning logic. Stable function identity.
  const positionHorizontally = useCallback((levels, nodeInfo) => {
    console.log("[useAutoLayout] Calculating horizontal positions..."); // Add log
    const {
      INITIAL_X_OFFSET, VERTICAL_NODE_DISTANCE, HORIZONTAL_LEVEL_DISTANCE
    } = LAYOUT_CONSTANTS;
    const positions = {}; // { nodeId: { x, y } }

    // Iterate through levels (columns) sorted numerically
    Object.keys(levels).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      const levelNodes = levels[level]; // Nodes in the current column
      const levelInt = parseInt(level);
      const columnX = INITIAL_X_OFFSET + levelInt * HORIZONTAL_LEVEL_DISTANCE;

      // Calculate total height required for this column (nodes + spacing)
      const totalHeight = levelNodes.reduce((sum, nodeId, index) => {
        const nodeHeight = nodeInfo[nodeId]?.dimensions?.height || NODE_DIMENSIONS.HEIGHT;
        // Add spacing only between nodes
        const spacing = (index < levelNodes.length - 1) ? VERTICAL_NODE_DISTANCE : 0;
        return sum + nodeHeight + spacing;
      }, 0);

      // Calculate starting Y position to center the column vertically (approx)
      // Adjust the base Y (e.g., 150) as needed
      let currentY = 100 - totalHeight / 2;

      // Position each node in the column
      levelNodes.forEach(nodeId => {
        if (!nodeInfo[nodeId]) return; // Skip if node info is missing
        const nodeHeight = nodeInfo[nodeId].dimensions.height;
        positions[nodeId] = { x: columnX, y: currentY };
        currentY += nodeHeight + VERTICAL_NODE_DISTANCE; // Move Y for the next node
      });
    });
    return positions;
  }, []); // No dependencies, logic is self-contained

  // Memoize the vertical positioning logic. Stable function identity.
  const positionVertically = useCallback((levels, nodeInfo) => {
    console.log("[useAutoLayout] Calculating vertical positions..."); // Add log
    const {
      INITIAL_Y_OFFSET, HORIZONTAL_NODE_DISTANCE, VERTICAL_LEVEL_DISTANCE
    } = LAYOUT_CONSTANTS;
    const positions = {}; // { nodeId: { x, y } }

    // Iterate through levels (rows) sorted numerically
    Object.keys(levels).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      const levelNodes = levels[level]; // Nodes in the current row
      const levelInt = parseInt(level);
      const rowY = INITIAL_Y_OFFSET + levelInt * VERTICAL_LEVEL_DISTANCE;

      // Calculate total width required for this row (nodes + spacing)
      const totalWidth = levelNodes.reduce((sum, nodeId, index) => {
        const nodeWidth = nodeInfo[nodeId]?.dimensions?.width || NODE_DIMENSIONS.WIDTH;
        const spacing = (index < levelNodes.length - 1) ? HORIZONTAL_NODE_DISTANCE : 0;
        return sum + nodeWidth + spacing;
      }, 0);

      // Calculate starting X position to center the row horizontally (approx)
       // Adjust the base X (e.g., 400) as needed
      let currentX = 300 - totalWidth / 2;

      // Position each node in the row
      levelNodes.forEach(nodeId => {
         if (!nodeInfo[nodeId]) return; // Skip if node info is missing
        const nodeWidth = nodeInfo[nodeId].dimensions.width;
        positions[nodeId] = { x: currentX, y: rowY };
        currentX += nodeWidth + HORIZONTAL_NODE_DISTANCE; // Move X for the next node
      });
    });
    return positions;
  }, []); // No dependencies, logic is self-contained

  // Memoize the main autoLayout function.
  // Its identity changes if its dependencies change.
  const autoLayout = useCallback(() => {
    console.log("[useAutoLayout] autoLayout function called."); // Add log
    // Check if there are nodes to layout
    if (nodes.length === 0) {
        console.log("[useAutoLayout] No nodes to layout.");
        return; // Exit if no nodes
    }

    const { levels, nodeInfo } = calculateNodeLevels();

    // Check if levels were successfully calculated
    if (Object.keys(levels).length === 0 && nodes.length > 0) {
        console.warn("[useAutoLayout] Node levels calculation resulted empty, but nodes exist. Check BFS logic or node/edge data.");
        // Optionally, provide default positions or skip update
        return;
    }

    const positions = isHorizontal
      ? positionHorizontally(levels, nodeInfo)
      : positionVertically(levels, nodeInfo);

    console.log("[useAutoLayout] Calculated positions:", positions); // Add log
    updateNodePositions(positions); // Call the update function passed as prop
  }, [
    nodes, // Add nodes as dependency here explicitly for the initial check
    calculateNodeLevels,    // Recalculated when nodes/edges change
    isHorizontal,           // Layout direction state
    positionHorizontally,   // Stable function reference
    positionVertically,     // Stable function reference
    updateNodePositions     // Stable function reference (from useDialogueManager)
  ]);

  return autoLayout; // Return the memoized layout function
};

export default useAutoLayout;