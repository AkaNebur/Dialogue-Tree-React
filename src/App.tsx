// src/App.tsx - Enhanced dark mode support
import React, { useCallback, useRef, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueManager from './hooks/useDialogueManager';
import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

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

  // Check system preference for dark mode
  const prefersDarkMode = window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize theme toggle with system preference
  const { isDarkMode, toggleTheme } = useThemeToggle(prefersDarkMode);

  // Listen for system dark mode preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      // Update your theme state based on system preference
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleChange as any);
      return () => mediaQuery.removeListener(handleChange as any);
    }
  }, []);

  // Store autoLayout function reference
  const handleAutoLayoutInitialized = useCallback((layoutFn: () => void) => {
    console.log("AutoLayout function received from DialogueFlow");
    autoLayoutRef.current = layoutFn;
  }, []);

  // Store fitView function reference
  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    console.log("FitView function received from DialogueFlow");
    fitViewRef.current = fitViewFn;
  }, []);

  return (
    // Full-screen container with dark mode class
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* ReactFlow takes up the entire screen */}
      <ReactFlowProvider>
        <div className="w-full h-full transition-colors duration-300">
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
      
      {/* Floating Header with Theme Toggle */}
      <div className="absolute top-4 right-4 z-30 transition-all duration-300">
        <Header
          isHorizontal={isHorizontal}
          onToggleLayout={toggleLayout}
          onFitView={triggerFitView}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      </div>
      
      {/* Floating Card Sidebar */}
      <div className="absolute top-4 left-4 z-20 transition-all duration-300">
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