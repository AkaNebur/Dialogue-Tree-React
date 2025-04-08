// src/App.tsx - Updated for full-screen flow with floating cards
import React, { useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueManager from './hooks/useDialogueManager';
import useLayoutToggle from './hooks/useLayoutToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import CardSidebar from './components/CardSidebar';

// Import global styles
import './styles/index.css';

/**
 * Main application component with full-screen flow and floating cards
 */
const App: React.FC = () => {
  const autoLayoutRef = useRef<(() => void) | null>(null);
  const fitViewRef = useRef<(() => void) | null>(null);

  // Use the Dialogue Manager hook
  const {
    npcs,
    selectedNpcId,
    selectedConversationId,
    activeNodes,
    activeEdges,
    setNodes,
    setEdges,
    addNpc,
    selectNpc,
    addConversation,
    selectConversation,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  } = useDialogueManager();

  // Initialize auto-layout trigger function
  const triggerAutoLayout = useCallback(() => {
    if (autoLayoutRef.current) {
      console.log("Triggering auto layout from App");
      autoLayoutRef.current();
    } else {
      console.warn("Auto layout function not yet available.");
    }
  }, []);

  // Initialize fitView trigger function
  const triggerFitView = useCallback(() => {
    if (fitViewRef.current) {
      console.log("Triggering fitView from App");
      fitViewRef.current();
    } else {
      console.warn("FitView function not yet available.");
    }
  }, []);

  // Initialize layout toggle
  const { isHorizontal, toggleLayout } = useLayoutToggle(
    updateNodeLayout,
    triggerAutoLayout
  );

  // Store autoLayout function reference from DialogueFlow
  const handleAutoLayoutInitialized = useCallback((layoutFn: () => void) => {
    console.log("AutoLayout function received from DialogueFlow");
    autoLayoutRef.current = layoutFn;
  }, []);

  // Store fitView function reference from DialogueFlow
  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    console.log("FitView function received from DialogueFlow");
    fitViewRef.current = fitViewFn;
  }, []);

  return (
    // Full-screen container
    <div className="w-screen h-screen relative overflow-hidden">
      {/* ReactFlow takes up the entire screen */}
      <ReactFlowProvider>
        <div className="w-full h-full">
          <DialogueFlow
            nodes={activeNodes}
            edges={activeEdges}
            setNodes={setNodes}
            setEdges={setEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isHorizontal={isHorizontal}
            updateNodePositions={updateNodePositions}
            onInitialized={handleAutoLayoutInitialized}
            onFitViewInitialized={handleFitViewInitialized}
            selectedConversationId={selectedConversationId}
          />
        </div>
      </ReactFlowProvider>
      
      {/* Floating Header */}
      <div className="absolute top-4 right-4 z-30">
        <Header
          isHorizontal={isHorizontal}
          onToggleLayout={toggleLayout}
          onFitView={triggerFitView}
        />
      </div>
      
      {/* Floating Card Sidebar */}
      <div className="absolute top-4 left-4 z-20">
        <CardSidebar
          npcs={npcs}
          selectedNpcId={selectedNpcId}
          selectedConversationId={selectedConversationId}
          onSelectNpc={selectNpc}
          onAddNpc={addNpc}
          onSelectConversation={selectConversation}
          onAddConversation={addConversation}
        />
      </div>
    </div>
  );
}

export default App;