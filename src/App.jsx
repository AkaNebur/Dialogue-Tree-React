import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueNodes from './hooks/useDialogueNodes';
import useLayoutToggle from './hooks/useLayoutToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';

// Import only global styles
import './styles/index.css';

/**
 * Main application component
 */
function App() {
  // Create a ref to store the autoLayout function
  const autoLayoutRef = useRef(null);

  // Initialize dialogue nodes and edges
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  } = useDialogueNodes();

  // Store the autoLayout function from DialogueFlow
  const setAutoLayoutRef = useCallback((layoutFn) => {
    autoLayoutRef.current = layoutFn;
  }, []);

  // Function to trigger auto layout - uses the ref
  const triggerAutoLayout = useCallback(() => {
    if (autoLayoutRef.current) {
      autoLayoutRef.current();
    }
  }, []);

  // Initialize layout toggle with the trigger function
  const { isHorizontal, toggleLayout } = useLayoutToggle(
    updateNodeLayout,
    triggerAutoLayout
  );

  return (
    <div className="app-container">
      {/* Header with controls */}
      <Header
        isHorizontal={isHorizontal}
        onToggleLayout={toggleLayout}
      />
      
      {/* ReactFlow provider is required for useReactFlow hook */}
      <ReactFlowProvider>
        <DialogueFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isHorizontal={isHorizontal}
          updateNodePositions={updateNodePositions}
          onInitialized={setAutoLayoutRef}
        />
      </ReactFlowProvider>
    </div>
  );
}

export default App;