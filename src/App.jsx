// src/App.jsx
import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
// import useDialogueNodes from './hooks/useDialogueNodes'; // No longer used directly here
import useDialogueManager from './hooks/useDialogueManager'; // Import the new manager hook
import useLayoutToggle from './hooks/useLayoutToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Import the Sidebar

// Import only global styles
import './styles/index.css';

/**
 * Main application component
 */
function App() {
  const autoLayoutRef = useRef(null);

  // Use the new Dialogue Manager hook
  const {
    npcs,
    selectedNpcId,
    selectedConversationId,
    activeNodes,          // Use activeNodes for the flow
    activeEdges,          // Use activeEdges for the flow
    setNodes,             // Pass down the active setNodes
    setEdges,             // Pass down the active setEdges
    addNpc,
    selectNpc,
    addConversation,
    selectConversation,
    onNodesChange,        // Use the manager's handlers
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  } = useDialogueManager();

  // Initialize auto-layout trigger function (targets active nodes/edges via manager)
  const triggerAutoLayout = useCallback(() => {
    if (autoLayoutRef.current) {
      console.log("Triggering auto layout from App");
      autoLayoutRef.current(); // This function is created by useAutoLayout inside DialogueFlow
    } else {
      console.warn("Auto layout function not yet available.");
    }
  }, []); // Dependency array is empty as autoLayoutRef.current is mutable

  // Initialize layout toggle (targets active nodes via manager)
  const { isHorizontal, toggleLayout } = useLayoutToggle(
    updateNodeLayout,   // This now updates the layout for the *active* conversation
    triggerAutoLayout   // This triggers layout for the *active* conversation
  );

  // Store autoLayout function reference from DialogueFlow
  // This function will be based on the *currently active* nodes/edges
  const handleAutoLayoutInitialized = useCallback((layoutFn) => {
     console.log("AutoLayout function received from DialogueFlow");
    autoLayoutRef.current = layoutFn;
    // Optionally run initial layout once the function is received
    // triggerAutoLayout(); // Might cause issues if called too early, DialogueFlow's effect is better
  }, []);


  return (
    // Use flexbox for overall layout
    <div className="flex w-screen h-screen app-container">
      {/* Sidebar */}
      <Sidebar
        npcs={npcs}
        selectedNpcId={selectedNpcId}
        selectedConversationId={selectedConversationId}
        onSelectNpc={selectNpc}
        onAddNpc={addNpc}
        onSelectConversation={selectConversation}
        onAddConversation={addConversation}
      />

      {/* Main Content Area */}
      <div className="flex-grow h-full relative">
        {/* Header remains positioned absolutely within the main area */}
        <Header
          isHorizontal={isHorizontal}
          onToggleLayout={toggleLayout}
          // Removed onAutoLayout prop from Header, trigger happens on toggle
        />

        {/* ReactFlow provider */}
        <ReactFlowProvider>
          <DialogueFlow
            // Pass the *active* nodes/edges and handlers
            nodes={activeNodes}
            edges={activeEdges}
            setNodes={setNodes} // Pass the setter for the active nodes
            setEdges={setEdges} // Pass the setter for the active edges
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isHorizontal={isHorizontal}
            updateNodePositions={updateNodePositions} // Pass the position updater
            onInitialized={handleAutoLayoutInitialized} // Receive the layout function
            selectedConversationId={selectedConversationId} // Pass down the ID
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default App;