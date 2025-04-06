import React, { useEffect, memo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useAutoLayout from './useAutoLayout';
import DialogueNode from './DialogueNode';

// Define custom node types
const nodeTypes = {
  custom: DialogueNode,
};

/**
 * Main dialogue flow component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.nodes - Flow nodes
 * @param {Array} props.edges - Flow edges
 * @param {Function} props.onNodesChange - Node change handler
 * @param {Function} props.onEdgesChange - Edge change handler
 * @param {Function} props.onConnect - Connection handler
 * @param {boolean} props.isHorizontal - Layout direction
 * @param {Function} props.updateNodePositions - Function to update node positions
 * @param {Function} props.onInitialized - Callback to pass autoLayout function
 */
const DialogueFlow = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  isHorizontal,
  updateNodePositions,
  onInitialized
}) => {
  const reactFlowInstance = useReactFlow();
  
  // Initialize auto-layout function
  const autoLayout = useAutoLayout(
    nodes,
    edges,
    isHorizontal,
    updateNodePositions
  );
  
  // Share the autoLayout function with parent component
  useEffect(() => {
    if (onInitialized && typeof onInitialized === 'function') {
      onInitialized(autoLayout);
    }
  }, [autoLayout, onInitialized]);
  
  // Apply auto-layout on initial render
  useEffect(() => {
    // Allow component to mount fully before layout
    const timer = setTimeout(() => {
      autoLayout();
      
      // Fit view to ensure all nodes are visible
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 50);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      attributionPosition="bottom-right"
      className="bg-gray-50"
    >
      <Controls />
      <MiniMap 
        nodeStrokeWidth={3}
        zoomable
        pannable
      />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DialogueFlow);