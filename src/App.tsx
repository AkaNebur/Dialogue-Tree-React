// src/App.tsx
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import NodePositioner from './components/NodePositioner';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';
import DatabaseManager from './components/DatabaseManager';

// Import store and specific state/actions needed HERE
import { useDialogueStore } from './store/dialogueStore';

import { calculateDagreLayout } from './utils/dagreLayout';
import { PositioningMode } from './types';

import './styles/index.css';

const App: React.FC = () => {
  const fitViewRef = useRef<(() => void) | null>(null);
  // Removed isInitialLayoutDone ref as it wasn't strictly needed for the fix

  // Get state and actions from Zustand store
  const loadInitialData = useDialogueStore(state => state.loadInitialData);
  const updateNodePositions = useDialogueStore(state => state.updateNodePositions);
  const updateNodeLayout = useDialogueStore(state => state.updateNodeLayout);
  const isLoading = useDialogueStore(state => state.isLoading);
  const isSaving = useDialogueStore(state => state.isSaving);
  const selectedConversationId = useDialogueStore(state => state.selectedConversationId);
  // We get length here for dependency, fetch actual nodes/edges inside effect
  const activeNodesLength = useDialogueStore(state => state.activeNodes().length);
  const activeEdgesLength = useDialogueStore(state => state.activeEdges().length);


  // UI State
  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);
  const [, setPositioningMode] = useState<PositioningMode>('dagre');
  const [layoutOptions, setLayoutOptions] = useState({ spacing: 150 });

  // Layout Toggle Hook
  const { isHorizontal, toggleLayout, setLayout } = useLayoutToggle(
    updateNodeLayout,
    (newIsHorizontal) => {
       console.log("[App] Direction changed:", newIsHorizontal ? 'horizontal' : 'vertical');
    },
    true, true
  );

  // Theme Hook
  const prefersDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const { isDarkMode, toggleTheme } = useThemeToggle(prefersDarkMode);

  // FitView Function Ref
  const triggerFitView = useCallback(() => {
    fitViewRef.current?.();
  }, []);

  // Load Initial Data on Mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Data Management Toggle
  const toggleDataManagement = useCallback(() => {
    setIsDataManagementVisible(prev => !prev);
  }, []);

  // Manual Layout Button Handler
  const applyNodePositioning = useCallback((mode: PositioningMode, options: { spacing?: number } = {}) => {
    setPositioningMode(mode);
    if (mode === 'dagre') {
      const newSpacing = options.spacing !== undefined ? options.spacing : layoutOptions.spacing;
      // Update local state ONLY if needed, let effect handle layout application
      if (newSpacing !== layoutOptions.spacing) {
         setLayoutOptions({ spacing: newSpacing });
      } else {
         // If spacing hasn't changed, force apply layout now by fetching current state
         const currentNodes = useDialogueStore.getState().activeNodes();
         const currentEdges = useDialogueStore.getState().activeEdges();
         if (currentNodes.length > 0) {
           console.log(`[App] Manually applying Dagre layout. Direction: ${isHorizontal ? 'LR' : 'TB'}, Spacing: ${newSpacing}`);
           const dagreDirection = isHorizontal ? 'LR' : 'TB';
           const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, newSpacing);
           updateNodePositions(newPositions); // Update store
           setTimeout(triggerFitView, 150); // Fit view after update
         }
      }
    }
  }, [layoutOptions.spacing, isHorizontal, updateNodePositions, triggerFitView]); // Keep dependencies needed for the function itself


  // System Dark Mode Listener
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return; // Guard for environments without matchMedia
    const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches !== isDarkMode) {
            toggleTheme();
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode, toggleTheme]);

  // Save Before Unload Confirmation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Access latest saving state directly from store inside the handler
      if (useDialogueStore.getState().isSaving) {
        event.preventDefault();
        event.returnValue = 'Changes are still saving. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // No dependencies needed, it accesses fresh state via getState

  // Data Import Handler (simple reload)
  const handleDataImported = useCallback(() => {
    window.location.reload();
  }, []);

  // Store FitView function from DialogueFlow
  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    fitViewRef.current = fitViewFn;
  }, []);

  // --- Automatic Layout Application Effect (FIXED) ---
  useEffect(() => {
    // Skip if loading or no nodes
    if (isLoading || activeNodesLength === 0) {
      console.log("[App Layout Effect] Skipping layout:", isLoading ? "Loading" : "No nodes");
      return;
    }

    console.log("[App Layout Effect] Applying layout.");
    // Get the current nodes/edges INSIDE the effect
    const currentNodes = useDialogueStore.getState().activeNodes();
    const currentEdges = useDialogueStore.getState().activeEdges();

    // Check again in case state changed between render and effect execution
    if (currentNodes.length === 0) {
        console.log("[App Layout Effect] Skipping layout: Nodes became empty.");
        return;
    }

    const dagreDirection = isHorizontal ? 'LR' : 'TB';
    const spacing = layoutOptions.spacing;

    const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, spacing);

    // Only update if newPositions is not empty (layout succeeded)
    if (Object.keys(newPositions).length > 0) {
        updateNodePositions(newPositions); // Call store action to update positions
        setTimeout(triggerFitView, 150); // Fit view after a short delay
    } else {
        console.warn("[App Layout Effect] Dagre layout returned empty positions.");
    }

  }, [ // --- FIXED DEPENDENCIES ---
      isLoading,
      selectedConversationId, // Re-layout when conversation changes
      isHorizontal,            // Re-layout when direction changes
      layoutOptions.spacing,   // Re-layout when spacing changes
      activeNodesLength,       // Re-layout when number of nodes changes
      activeEdgesLength,       // Re-layout when number of edges changes
      // Include actions used inside the effect if they are stable references (Zustand actions usually are)
      updateNodePositions,
      triggerFitView
    ]); // REMOVED activeNodes, activeEdges OBJECTS from dependencies


  return (
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <DatabaseManager />

      {/* Loading Overlay */}
      {isLoading && (
         <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mb-3"></div>
                <p className="text-white text-lg font-medium">Loading Dialogue Data...</p>
            </div>
         </div>
      )}

      {/* Main Flow Area */}
      <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {!isLoading && (
          <ReactFlowProvider>
              <DialogueFlow
                isHorizontal={isHorizontal}
                onFitViewInitialized={handleFitViewInitialized}
              />
          </ReactFlowProvider>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-30 flex space-x-3">
        <NodePositioner
          onApplyLayout={applyNodePositioning}
          isHorizontal={isHorizontal}
          onToggleDirection={toggleLayout}
          onFitView={triggerFitView}
          setLayout={setLayout}
        />
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          isDataManagementVisible={isDataManagementVisible}
          onToggleDataManagement={toggleDataManagement}
        />
      </div>

      {/* Sidebar */}
      <div className="absolute top-4 left-4 z-20">
         <CardSidebar />
      </div>

      {/* Data Management Panel */}
      {isDataManagementVisible && (
        <div className="absolute top-20 right-4 z-30">
          <DataActions onDataImported={handleDataImported} />
        </div>
      )}

      {/* Auto Save Indicator */}
      <AutoSaveIndicator />
    </div>
  );
};

export default App;