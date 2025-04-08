// src/App.tsx - Enhanced with toggle for Data Management
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Custom hooks
import useDialogueManager from './hooks/useDialogueManager';
import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';

// Import global styles
import './styles/index.css';

/**
 * Main application component with auto-save functionality
 */
const App: React.FC = () => {
  const autoLayoutRef = useRef<(() => void) | null>(null);
  const fitViewRef = useRef<(() => void) | null>(null);
  
  // Add state for Data Management visibility
  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);

  // Use the enhanced Dialogue Manager hook with auto-save
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
    // Auto-save related properties
    isSaving,
    lastSaved,
    isLoading,
    saveImmediately
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
  
  // Toggle function for Data Management visibility
  const toggleDataManagement = useCallback(() => {
    setIsDataManagementVisible(prev => !prev);
  }, []);

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

  return (
    // Full-screen container with dark mode class
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
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
      
      {/* Floating Header with Theme Toggle and Data Management Toggle */}
      <div className="absolute top-4 right-4 z-30 transition-all duration-300">
        <Header
          isHorizontal={isHorizontal}
          onToggleLayout={toggleLayout}
          onFitView={triggerFitView}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isDataManagementVisible={isDataManagementVisible}
          onToggleDataManagement={toggleDataManagement}
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
}

export default App;