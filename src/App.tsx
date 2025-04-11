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
import Toolbar from './components/Toolbar';
import EditModal from './components/EditModal'; // Import EditModal
import InfoModal from './components/InfoModal'; // Import InfoModal

// Import store and specific state/actions needed HERE
import { useDialogueStore, useSidebarData } from './store/dialogueStore'; // Import useSidebarData

import { calculateDagreLayout } from './utils/dagreLayout';
import { PositioningMode, NPC } from './types'; // Import NPC type

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

  // Get state and actions from Zustand store
  const loadInitialData = useDialogueStore(state => state.loadInitialData);
  const updateNodePositions = useDialogueStore(state => state.updateNodePositions);
  const updateNodeLayout = useDialogueStore(state => state.updateNodeLayout);
  const isLoading = useDialogueStore(state => state.isLoading);
  const isSaving = useDialogueStore(state => state.isSaving);
  const selectedConversationId = useDialogueStore(state => state.selectedConversationId);
  const activeNodesLength = useDialogueStore(state => state.activeNodes().length);
  const activeEdgesLength = useDialogueStore(state => state.activeEdges().length);

  // Get sidebar actions directly from store hook
  const {
      deleteNpc,
      deleteConversation,
      updateNpcName,
      updateConversationName,
      updateNpcImage,
  } = useSidebarData();


  // --- UI State ---
  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);
  const [, setPositioningMode] = useState<PositioningMode>('dagre');
  const [layoutOptions, setLayoutOptions] = useState({ spacing: 150 });

  // --- Modal States (Lifted from CardSidebar) ---
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [editModalState, setEditModalState] = useState<EditModalState>({
    isOpen: false,
    entityType: 'NPC',
    entityId: '',
    currentName: '',
    currentImage: undefined,
  });
  // --- ---

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
      if (newSpacing !== layoutOptions.spacing) {
         setLayoutOptions({ spacing: newSpacing });
      } else {
         const currentNodes = useDialogueStore.getState().activeNodes();
         const currentEdges = useDialogueStore.getState().activeEdges();
         if (currentNodes.length > 0) {
           console.log(`[App] Manually applying Dagre layout. Direction: ${isHorizontal ? 'LR' : 'TB'}, Spacing: ${newSpacing}`);
           const dagreDirection = isHorizontal ? 'LR' : 'TB';
           const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, newSpacing);
           updateNodePositions(newPositions);
           setTimeout(triggerFitView, 150);
         }
      }
    }
  }, [layoutOptions.spacing, isHorizontal, updateNodePositions, triggerFitView]);


  // System Dark Mode Listener
  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;
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
      if (useDialogueStore.getState().isSaving) {
        event.preventDefault();
        event.returnValue = 'Changes are still saving. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
     return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Data Import Handler (simple reload)
  const handleDataImported = useCallback(() => {
    window.location.reload();
  }, []);

  // Store FitView function from DialogueFlow
  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    fitViewRef.current = fitViewFn;
  }, []);

  // --- Automatic Layout Application Effect ---
  useEffect(() => {
    if (isLoading || activeNodesLength === 0) {
      console.log("[App Layout Effect] Skipping layout:", isLoading ? "Loading" : "No nodes");
      return;
    }
    console.log("[App Layout Effect] Applying layout.");
    const currentNodes = useDialogueStore.getState().activeNodes();
    const currentEdges = useDialogueStore.getState().activeEdges();
    if (currentNodes.length === 0) {
        console.log("[App Layout Effect] Skipping layout: Nodes became empty.");
        return;
    }
    const dagreDirection = isHorizontal ? 'LR' : 'TB';
    const spacing = layoutOptions.spacing;
    const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, spacing);
    if (Object.keys(newPositions).length > 0) {
        updateNodePositions(newPositions);
        setTimeout(triggerFitView, 150);
    } else {
        console.warn("[App Layout Effect] Dagre layout returned empty positions.");
    }
  }, [
      isLoading, selectedConversationId, isHorizontal, layoutOptions.spacing,
      activeNodesLength, activeEdgesLength, updateNodePositions, triggerFitView
    ]);

  // --- Modal Handling Functions ---
  const handleOpenInfoModal = useCallback(() => {
    setIsInfoModalOpen(true);
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setIsInfoModalOpen(false);
  }, []);

  const handleOpenEditModal = useCallback((type: 'NPC' | 'Dialogue', id: string, name: string, image?: string) => {
      setEditModalState({
          isOpen: true,
          entityType: type,
          entityId: id,
          currentName: name,
          currentImage: image,
      });
  }, []);

  const handleCloseEditModal = useCallback(() => {
      setEditModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

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
  // --- ---

  return (
    // Ensure the main container has position relative for z-index context
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

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <Toolbar />
      </div>

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
         {/* Pass modal opening functions down */}
         <CardSidebar
            onOpenInfoModal={handleOpenInfoModal}
            onOpenEditModal={handleOpenEditModal}
         />
      </div>

      {/* Data Management Panel */}
      {isDataManagementVisible && (
        <div className="absolute top-20 right-4 z-30">
          <DataActions onDataImported={handleDataImported} />
        </div>
      )}

      {/* Auto Save Indicator */}
      <AutoSaveIndicator />

      {/* --- Render Modals at Top Level --- */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfoModal}
      />
      <EditModal
        isOpen={editModalState.isOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveChanges}
        onDelete={handleDeleteEntity}
        title={`Edit ${editModalState.entityType} ${editModalState.entityType === 'NPC' ? 'Profile' : 'Name'}`}
        currentName={editModalState.currentName}
        currentImage={editModalState.currentImage}
        entityType={editModalState.entityType}
      />
      {/* --- --- */}
    </div>
  );
};

export default App;