import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  getIncomers,
  getOutgoers,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Initial nodes for our dialogue tree
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Conversation' },
    position: { x: 250, y: 0 },
    className: 'node-start',
  },
  {
    id: '2',
    data: { label: 'Hello, how are you?' },
    position: { x: 100, y: 100 },
    className: 'node-hello',
  },
  {
    id: '3',
    data: { label: 'Would you like to know more about our products?' },
    position: { x: 400, y: 100 },
    className: 'node-products',
  },
  {
    id: '4',
    data: { label: 'I\'m feeling great!' },
    position: { x: 100, y: 200 },
    className: 'node-great',
  },
  {
    id: '5',
    data: { label: 'Yes, tell me more' },
    position: { x: 300, y: 200 },
    className: 'node-more',
  },
  {
    id: '6',
    data: { label: 'No, maybe later' },
    position: { x: 500, y: 200 },
    className: 'node-later',
  },
];

// Initial connections between nodes
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isHorizontal, setIsHorizontal] = useState(true);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const toggleLayout = useCallback(() => {
    setIsHorizontal(!isHorizontal);
  }, [isHorizontal]);
  
  // Auto-layout function for repositioning nodes
  const autoLayout = useCallback(() => {
    // Define spacing based on the current layout
    const HORIZONTAL_NODE_DISTANCE = 250; // Increased to prevent overlap
    const VERTICAL_NODE_DISTANCE = 150;   // Increased to prevent overlap
    const LEVEL_DISTANCE = isHorizontal ? 300 : 150;
    const NODE_WIDTH = 150;
    const NODE_HEIGHT = 60;
    
    // Calculate new positions for all nodes
    const newPositions = {};
    
    // Function to get node dimensions based on content
    const getNodeDimensions = (nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      // Estimate based on label length if available
      const estimatedWidth = node?.data?.label?.length 
        ? Math.max(NODE_WIDTH, node.data.label.length * 8) 
        : NODE_WIDTH;
      
      return {
        width: estimatedWidth,
        height: NODE_HEIGHT
      };
    };
    
    // Create levels to track nodes at each depth
    const levels = {};
    const nodeInfo = {};
    
    // Find root nodes (nodes without incoming edges)
    const rootNodes = nodes.filter((node) => {
      return !edges.some((edge) => edge.target === node.id);
    });
    
    // Add a default root node if there are none
    const processedRoots = rootNodes.length > 0 ? rootNodes : [nodes[0]];
    
    // Get all connections for each node
    nodes.forEach(node => {
      nodeInfo[node.id] = {
        children: edges.filter(e => e.source === node.id).map(e => e.target),
        parents: edges.filter(e => e.target === node.id).map(e => e.source),
        level: -1,
        dimensions: getNodeDimensions(node.id)
      };
    });
    
    // Assign levels to all nodes starting from roots
    const assignLevels = () => {
      // Start with roots at level 0
      const queue = processedRoots.map(node => ({
        id: node.id,
        level: 0
      }));
      
      while (queue.length > 0) {
        const { id, level } = queue.shift();
        
        // If this node already has a higher or equal level assigned, skip
        if (nodeInfo[id].level >= level) continue;
        
        nodeInfo[id].level = level;
        
        // Add this node to its level
        if (!levels[level]) {
          levels[level] = [];
        }
        levels[level].push(id);
        
        // Queue all children with incremented level
        nodeInfo[id].children.forEach(childId => {
          queue.push({
            id: childId,
            level: level + 1
          });
        });
      }
    };
    
    assignLevels();
    
    // Calculate positions for horizontal layout
    const positionHorizontally = () => {
      // For each level
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
          newPositions[nodeId] = {
            x: 50 + levelInt * LEVEL_DISTANCE,
            y: currentY
          };
          
          currentY += nodeInfo[nodeId].dimensions.height + VERTICAL_NODE_DISTANCE;
        });
      });
    };
    
    // Calculate positions for vertical layout
    const positionVertically = () => {
      // For each level
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
          newPositions[nodeId] = {
            x: currentX,
            y: 50 + levelInt * LEVEL_DISTANCE
          };
          
          currentX += nodeInfo[nodeId].dimensions.width + HORIZONTAL_NODE_DISTANCE;
        });
      });
    };
    
    // Position based on current layout mode
    if (isHorizontal) {
      positionHorizontally();
    } else {
      positionVertically();
    }
    
    // Update all node positions
    setNodes(nds => 
      nds.map(node => {
        if (newPositions[node.id]) {
          return {
            ...node,
            position: newPositions[node.id]
          };
        }
        return node;
      })
    );
    
  }, [nodes, edges, isHorizontal, setNodes]);

  // Update nodes when layout changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        return {
          ...node,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
        };
      })
    );
  }, [isHorizontal, setNodes]);
  
  // Auto-position nodes on initial load
  useEffect(() => {
    // Use setTimeout to ensure all nodes are properly initialized
    const timer = setTimeout(() => {
      autoLayout();
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <div className="header-overlay">
        <h1 className="header-title">Dialogue Tree Builder</h1>
        <p className="header-subtitle">Create and visualize dialogue trees for your game or application</p>
        <div className="buttons-container">
          <button 
            onClick={toggleLayout} 
            className="layout-toggle-btn"
          >
            {isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
          </button>
          <button 
            onClick={autoLayout} 
            className="auto-layout-btn"
          >
            Auto-arrange Nodes
          </button>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        className="react-flow-container"
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}

export default App;