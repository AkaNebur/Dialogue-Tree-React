// src/App.tsx
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';

// Hooks
import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

// Components
import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import NodePositioner from './components/NodePositioner';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';
import DatabaseManager from './components/DatabaseManager';
import Toolbar from './components/Toolbar';
import EditModal from './components/EditModal';
import InfoModal from './components/InfoModal';
import NodeInfoPanel from './components/NodeInfoPanel';

// Store Hooks
import {
    useDialogueStore,
    useSidebarData,
    useNodeInfoPanelData // Hook for node panel state/actions
} from './store/dialogueStore';

// Utilities & Types
import { calculateDagreLayout } from './utils/dagreLayout';
import { PositioningMode } from './types';

// Styles
import './styles/index.css';

// Define types for Edit Modal state
interface EditModalState {
  isOpen: boolean;
  entityType: 'NPC' | 'Dialogue';
  entityId: string;
  currentName: string;
  currentImage?: string;
}

const App: React.FC = () => {
  const fitViewRef = useRef<(() => void) | null>(null);

  // --- Get state and actions from Zustand store ---
  const loadInitialData = useDialogueStore(state => state.loadInitialData);
  const updateNodePositions = useDialogueStore(state => state.updateNodePositions);
  const updateNodeLayout = useDialogueStore(state => state.updateNodeLayout);
  const isLoading = useDialogueStore(state => state.isLoading);
  const isSaving = useDialogueStore(state => state.isSaving);
  const selectedConversationId = useDialogueStore(state => state.selectedConversationId);
  const activeNodesLength = useDialogueStore(state => state.activeNodes().length);
  const activeEdgesLength = useDialogueStore(state => state.activeEdges().length);

  // Sidebar Actions from dedicated hook
  const {
      deleteNpc,
      deleteConversation,
      updateNpcName,
      updateConversationName,
      updateNpcImage,
  } = useSidebarData();

  // Node Info Panel Data and Actions from dedicated hook
  const { selectedNode, updateNodeData } = useNodeInfoPanelData();

  // --- Local UI State ---
  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);
  const [, setPositioningMode] = useState<PositioningMode>('dagre'); // Keep track, though only dagre is triggered by button now
  const [layoutOptions, setLayoutOptions] = useState({ spacing: 150 }); // Spacing for Dagre layout
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [editModalState, setEditModalState] = useState<EditModalState>({
    isOpen: false,
    entityType: 'NPC',
    entityId: '',
    currentName: '',
    currentImage: undefined,
  });

  // --- Custom Hooks ---
  const { isHorizontal, toggleLayout, setLayout } = useLayoutToggle(
    updateNodeLayout, // Callback to update node handle positions in store
    (newIsHorizontal) => { console.log("[App] Direction changed:", newIsHorizontal ? 'horizontal' : 'vertical'); },
    true, // Initial direction (horizontal)
    true // Save preference to localStorage
  );

  const prefersDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const { isDarkMode, toggleTheme } = useThemeToggle(prefersDarkMode); // Theme hook

  // --- Callbacks ---
  const triggerFitView = useCallback(() => {
    fitViewRef.current?.();
  }, []);

  const toggleDataManagement = useCallback(() => {
    setIsDataManagementVisible(prev => !prev);
  }, []);

  // Reload page after importing data to ensure clean state
  const handleDataImported = useCallback(() => {
    window.location.reload();
  }, []);

  // Store the fitView function provided by ReactFlow
  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    fitViewRef.current = fitViewFn;
  }, []);

  // Modal Handlers
  const handleOpenInfoModal = useCallback(() => { setIsInfoModalOpen(true); }, []);
  const handleCloseInfoModal = useCallback(() => { setIsInfoModalOpen(false); }, []);
  const handleOpenEditModal = useCallback((type: 'NPC' | 'Dialogue', id: string, name: string, image?: string) => {
      setEditModalState({ isOpen: true, entityType: type, entityId: id, currentName: name, currentImage: image });
  }, []);
  const handleCloseEditModal = useCallback(() => { setEditModalState(prev => ({ ...prev, isOpen: false })); }, []);
  const handleSaveChanges = useCallback((newName: string, imageDataUrl?: string) => {
    const { entityType, entityId } = editModalState;
    if (entityType === 'NPC') {
       updateNpcName(entityId, newName);
       updateNpcImage(entityId, imageDataUrl);
    } else if (entityType === 'Dialogue') {
       updateConversationName(entityId, newName);
    }
    handleCloseEditModal();
  }, [editModalState, updateNpcName, updateNpcImage, updateConversationName, handleCloseEditModal]);
  const handleDeleteEntity = useCallback(() => {
    const { entityType, entityId } = editModalState;
    if (entityType === 'NPC') {
      deleteNpc(entityId);
    } else if (entityType === 'Dialogue') {
      deleteConversation(entityId);
    }
    handleCloseEditModal();
  }, [editModalState, deleteNpc, deleteConversation, handleCloseEditModal]);

  // Callback for NodePositioner component to trigger layout calculation
  const applyNodePositioning = useCallback((mode: PositioningMode, options: { spacing?: number } = {}) => {
    setPositioningMode(mode);
    if (mode === 'dagre') {
      const newSpacing = options.spacing !== undefined ? options.spacing : layoutOptions.spacing;
      // Update local state if spacing slider changes, triggering useEffect for layout
      if (newSpacing !== layoutOptions.spacing) {
         setLayoutOptions({ spacing: newSpacing });
      } else {
         // If spacing hasn't changed, force a layout calculation (e.g., clicking "Smart Layout" button)
         const currentNodes = useDialogueStore.getState().activeNodes();
         const currentEdges = useDialogueStore.getState().activeEdges();
         if (currentNodes.length > 0) {
           console.log(`[App] Manually applying Dagre layout. Direction: ${isHorizontal ? 'LR' : 'TB'}, Spacing: ${newSpacing}`);
           const dagreDirection = isHorizontal ? 'LR' : 'TB';
           const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, newSpacing);
           updateNodePositions(newPositions);
           setTimeout(triggerFitView, 150); // Fit view after applying layout
         }
      }
    }
  }, [layoutOptions.spacing, isHorizontal, updateNodePositions, triggerFitView]);


  // --- Effects ---
  // Load Initial Data on Mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Listener for System Dark Mode Changes
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;
    const handleChange = (e: MediaQueryListEvent) => {
        // Toggle theme only if the system preference changes and differs from current state
        if (e.matches !== isDarkMode) {
            toggleTheme();
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isDarkMode, toggleTheme]);

  // Prevent leaving page if changes are currently saving
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (useDialogueStore.getState().isSaving) {
        event.preventDefault();
        event.returnValue = 'Changes are still saving. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // No dependencies needed as it reads latest state directly

   // Effect to Apply Auto-Layout when relevant state changes
   useEffect(() => {
     // Skip layout if loading, or no nodes exist in the active conversation
     if (isLoading || activeNodesLength === 0) {
       console.log("[App Layout Effect] Skipping layout:", isLoading ? "Loading" : "No nodes");
       return;
     }

     console.log("[App Layout Effect] Applying layout (triggered by dependency change).");
     const currentNodes = useDialogueStore.getState().activeNodes();
     const currentEdges = useDialogueStore.getState().activeEdges();

     // Double-check nodes haven't become empty just before layout
     if (currentNodes.length === 0) {
         console.log("[App Layout Effect] Skipping layout: Nodes became empty.");
         return;
     }

     const dagreDirection = isHorizontal ? 'LR' : 'TB';
     const spacing = layoutOptions.spacing;
     const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, spacing);

     if (Object.keys(newPositions).length > 0) {
         updateNodePositions(newPositions);
         // Fit view after layout calculation with a short delay
         setTimeout(triggerFitView, 150);
     } else {
         console.warn("[App Layout Effect] Dagre layout returned empty positions.");
     }
   }, [
       // Dependencies that should trigger a re-layout:
       isLoading,                // When loading finishes
       selectedConversationId, // When the active conversation changes
       isHorizontal,             // When layout direction changes
       layoutOptions.spacing,    // When node spacing changes via slider
       activeNodesLength,        // When the number of nodes changes (add/delete)
       activeEdgesLength,        // When the number of edges changes (add/delete)
       // Stable dependencies (functions from Zustand/useCallback):
       updateNodePositions,
       triggerFitView
     ]);


  return (
    // Main container sets the dark mode class and relative positioning context
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Database status indicator (bottom-left) */}
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

      {/* Toolbar (Top Center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <Toolbar />
      </div>

      {/* Main React Flow Canvas Area */}
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

      {/* Floating Controls Group (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col space-y-3 items-end">
        {/* Row for Layout and Main Header Buttons */}
        <div className="flex space-x-3">
             <NodePositioner
               onApplyLayout={applyNodePositioning}
               isHorizontal={isHorizontal}
               onToggleDirection={toggleLayout}
               onFitView={triggerFitView}
               setLayout={setLayout} // Pass direct setter from layout hook
             />
             <Header
               isDarkMode={isDarkMode}
               onToggleTheme={toggleTheme}
               isDataManagementVisible={isDataManagementVisible}
               onToggleDataManagement={toggleDataManagement}
             />
        </div>

         {/* Data Management Panel (Conditionally Rendered Below Header Row) */}
         {isDataManagementVisible && (
           <DataActions onDataImported={handleDataImported} />
         )}

         {/* Node Info Panel (Conditionally Rendered - Only if a single node is selected) */}
         {selectedNode && (
             <NodeInfoPanel
                node={selectedNode}
                onUpdateLabel={updateNodeData}
             />
         )}
          {/* Placeholder if no single node selected, but can be omitted */}
         {/* {!selectedNode && (
              <div className="w-64 p-4 text-center text-xs text-gray-400 dark:text-gray-500">...</div>
          )} */}
      </div>

      {/* Sidebar (Top Left) */}
      <div className="absolute top-4 left-4 z-20">
         <CardSidebar
            onOpenInfoModal={handleOpenInfoModal}
            onOpenEditModal={handleOpenEditModal}
         />
      </div>

      {/* Auto Save Indicator (Bottom Right) */}
      <AutoSaveIndicator />

      {/* Modals (Rendered at top level for correct stacking) */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
      />
      <EditModal
        isOpen={editModalState.isOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveChanges}
        onDelete={handleDeleteEntity}
        title={`Edit ${editModalState.entityType}`}
        currentName={editModalState.currentName}
        currentImage={editModalState.currentImage}
        entityType={editModalState.entityType}
      />
    </div>
  );
};

export default App;