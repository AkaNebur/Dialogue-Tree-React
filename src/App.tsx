// src/App.tsx - Updated to include DatabaseManager
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueManager from './hooks/useDialogueManager';
import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import NodePositioner from './components/NodePositioner';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';
import IdManagerInitializer from './components/IdManagerInitializer';
import IdDebugger from './components/IdDebugger';
import DatabaseManager from './components/DatabaseManager'; // Import the new component

// Utilities
import { calculateNodePositions, PositioningMode } from './utils/nodePositioning';
import { calculateDagreLayout } from './utils/dagreLayout';

// Import global styles
import './styles/index.css';

/**
 * Main application component with NPC image editing functionality
 */
const App: React.FC = () => {
  const autoLayoutRef = useRef<(() => void) | null>(null);
  const fitViewRef = useRef<(() => void) | null>(null);

  // Add state for Data Management visibility
  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);

  // Add state for node positioning
  const [positioningMode, setPositioningMode] = useState<PositioningMode>('horizontal');
  const [layoutOptions, setLayoutOptions] = useState({
    spacing: 150,
    gridColumns: 3
  });

  // Use the enhanced Dialogue Manager hook with auto-save and name/image editing
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
    deleteNpc,
    addConversation,
    selectConversation,
    deleteConversation,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
    // Name and image editing functions
    updateNpcName,
    updateConversationName,
    updateNpcImage,
    // Auto-save related properties
    isSaving,
    lastSaved,
    isLoading
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

  // Initialize layout toggle with refactored hook
  const { isHorizontal, toggleLayout, setLayout, direction } = useLayoutToggle(
    updateNodeLayout,
    triggerAutoLayout,
    true,  // Default to horizontal initially
    true   // Save preference in localStorage
  );

  // Check system preference for dark mode
  const prefersDarkMode = window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize theme toggle with system preference
  const { isDarkMode, toggleTheme } = useThemeToggle(prefersDarkMode);

  // Toggle function for Data Management visibility
  const toggleDataManagement = useCallback(() => {
    setIsDataManagementVisible(prev => !prev);
  }, []);

  // Apply custom node positioning with Dagre integration
  const applyNodePositioning = useCallback((mode: PositioningMode, options: { spacing?: number; gridColumns?: number } = {}) => {
    console.log(`Applying ${mode} positioning with options:`, options);

    // Update positioning mode state
    setPositioningMode(mode);
    setLayoutOptions(prev => ({ ...prev, ...options }));

    // Update layout direction if using horizontal/vertical mode
    if (mode === 'horizontal' && !isHorizontal) {
      setLayout(true);
    } else if (mode === 'vertical' && isHorizontal) {
      setLayout(false);
    } else if (mode === 'dagre') {
      // Use Dagre layout algorithm
      console.log("Applying Dagre layout...");
      const direction = isHorizontal ? 'LR' : 'TB';
      const spacing = options.spacing || layoutOptions.spacing;

      const newPositions = calculateDagreLayout(
        activeNodes,
        activeEdges,
        direction,
        spacing
      );

      // Update node positions
      updateNodePositions(newPositions);

      // Fit view after positioning
      setTimeout(() => {
        triggerFitView();
      }, 100);
    } else {
      // For other layout modes, use the existing node positioning utility
      const newPositions = calculateNodePositions(
        activeNodes,
        activeEdges,
        mode,
        { ...layoutOptions, ...options }
      );

      // Update node positions
      updateNodePositions(newPositions);

      // Fit view after positioning
      setTimeout(() => {
        triggerFitView();
      }, 100);
    }
  }, [
    activeNodes,
    activeEdges,
    updateNodePositions,
    triggerFitView,
    layoutOptions,
    isHorizontal,
    setLayout
  ]);

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

  // Save data before window unload (when user closes the tab/browser)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        // If currently saving, show a confirmation dialog
        e.preventDefault();
        e.returnValue = "Changes are being saved. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaving]);

  // Handler for when data is imported
  const handleDataImported = useCallback(() => {
    // Reload the page to refresh all state
    window.location.reload();
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

  // Update positioning mode when direction changes
  useEffect(() => {
    // Update positioning mode based on current direction
    if (direction === 'horizontal' && positioningMode === 'vertical') {
      setPositioningMode('horizontal');
    } else if (direction === 'vertical' && positioningMode === 'horizontal') {
      setPositioningMode('vertical');
    }
  }, [direction, positioningMode]);

  return (
    // Full-screen container with dark mode class
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Add IdManagerInitializer to handle ID persistence */}
      <IdManagerInitializer />

      {/* Add Database Manager for handling database versioning issues */}
      <DatabaseManager />

      {/* Optional: Add ID Debugger for development and troubleshooting */}
      {process.env.NODE_ENV === 'development' && <IdDebugger />}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dialogue trees...</p>
          </div>
        </div>
      )}

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

      {/* Floating Header with Layout Controls - Now integrated */}
      <div className="absolute top-4 right-4 z-30 flex space-x-3 transition-all duration-300">
        {/* Enhanced Node Positioner component with direction toggle */}
        <NodePositioner
          onApplyLayout={applyNodePositioning}
          currentLayout={positioningMode}
          nodeCount={activeNodes.length}
          isHorizontal={isHorizontal}
          onToggleDirection={toggleLayout}
          onFitView={triggerFitView}
          setLayout={setLayout} // Pass the new direct layout setter
        />

        {/* Updated Header component (without layout toggle) */}
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isDataManagementVisible={isDataManagementVisible}
          onToggleDataManagement={toggleDataManagement}
        />
      </div>

      {/* Floating Card Sidebar with name and image editing functionality */}
      <div className="absolute top-4 left-4 z-20 transition-all duration-300">
        <CardSidebar
          npcs={npcs}
          selectedNpcId={selectedNpcId}
          selectedConversationId={selectedConversationId}
          onSelectNpc={selectNpc}
          onAddNpc={addNpc}
          onSelectConversation={selectConversation}
          onAddConversation={addConversation}
          onUpdateNpcName={updateNpcName}
          onUpdateConversationName={updateConversationName}
          onUpdateNpcImage={updateNpcImage}
          onDeleteNpc={deleteNpc}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Data Management Actions (Export/Import) - Only show when visible */}
      {isDataManagementVisible && (
        <div className="absolute top-20 right-4 z-30 transition-opacity duration-300">
          <DataActions onDataImported={handleDataImported} />
        </div>
      )}

      {/* Auto-save Indicator */}
      <AutoSaveIndicator isSaving={isSaving || false} lastSaved={lastSaved || null} />
    </div>
  );
};

export default App;