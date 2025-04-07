// App.jsx

import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueNodes from './hooks/useDialogueNodes'; // Ensure this path is correct
import useLayoutToggle from './hooks/useLayoutToggle'; // Ensure this path is correct

// Components
import DialogueFlow from './components/DialogueFlow'; // Ensure this path is correct
import Header from './components/Header'; // Ensure this path is correct

// Import only global styles
import './styles/index.css';

/**
 * Main application component
 */
function App() {
  // Store autoLayout reference
  const autoLayoutRef = useRef(null);

  // Initialize dialogue nodes and edges state
  const {
    nodes,
    edges,
    setNodes, // Get setNodes from the hook
    setEdges, // Get setEdges from the hook
    onNodesChange,
    onEdgesChange,
    onConnect,
    // createOnConnectEnd is no longer returned or needed here
    updateNodePositions,
    updateNodeLayout,
  } = useDialogueNodes();

  // Initialize auto-layout trigger function
  const triggerAutoLayout = useCallback(() => {
    if (autoLayoutRef.current) {
      autoLayoutRef.current();
    }
  }, []);

  // Initialize layout toggle
  const { isHorizontal, toggleLayout } = useLayoutToggle(
    updateNodeLayout,
    triggerAutoLayout
  );

  // Store autoLayout reference from DialogueFlow
  const handleAutoLayout = useCallback((layoutFn) => {
    autoLayoutRef.current = layoutFn;
  }, []);

  return (
    <div className="app-container">
      {/* Header with controls */}
      <Header
        isHorizontal={isHorizontal}
        onToggleLayout={toggleLayout}
        onAutoLayout={triggerAutoLayout}
      />

      {/* ReactFlow provider is required for useReactFlow hook */}
      <ReactFlowProvider>
        <DialogueFlow
          nodes={nodes}
          edges={edges}
          setNodes={setNodes} // Pass setNodes down
          setEdges={setEdges} // Pass setEdges down
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          // onConnectEnd prop is removed - it's handled inside DialogueFlow now
          isHorizontal={isHorizontal}
          updateNodePositions={updateNodePositions}
          onInitialized={handleAutoLayout} // Passes the autoLayout function up
        />
      </ReactFlowProvider>
    </div>
  );
}

export default App;