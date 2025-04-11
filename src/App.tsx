import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ArrowDown, ArrowRight, GitFork } from 'lucide-react';

import useLayoutToggle from './hooks/useLayoutToggle';
import useThemeToggle from './hooks/useThemeToggle';

import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import NodePositioner from './components/NodePositioner';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';
import DatabaseManager from './components/DatabaseManager';
import Toolbar, { ToolType } from './components/Toolbar';
import EditModal from './components/EditModal';
import InfoModal from './components/InfoModal';
import NodeInfoPanel from './components/NodeInfoPanel';

import {
    useDialogueStore,
    useSidebarData,
} from './store/dialogueStore';

import { calculateDagreLayout } from './utils/dagreLayout';
import { PositioningMode } from './types';

import './styles/index.css';

interface EditModalState {
  isOpen: boolean;
  entityType: 'NPC' | 'Dialogue';
  entityId: string;
  currentName: string;
  currentImage?: string;
}

const App: React.FC = () => {
  const fitViewRef = useRef<(() => void) | null>(null);

  const loadInitialData = useDialogueStore(state => state.loadInitialData);
  const updateNodePositions = useDialogueStore(state => state.updateNodePositions);
  const updateNodeLayout = useDialogueStore(state => state.updateNodeLayout);
  const isLoading = useDialogueStore(state => state.isLoading);
  const selectedConversationId = useDialogueStore(state => state.selectedConversationId);
  const activeNodesLength = useDialogueStore(state => state.activeNodes().length);
  const activeEdgesLength = useDialogueStore(state => state.activeEdges().length);

  const {
      deleteNpc,
      deleteConversation,
      updateNpcName,
      updateConversationName,
      updateNpcImage,
  } = useSidebarData();

  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);
  const [isLayoutOptionsOpen, setIsLayoutOptionsOpen] = useState<boolean>(false);
  const [, setPositioningMode] = useState<PositioningMode>('dagre');
  const [layoutOptions, setLayoutOptions] = useState({ spacing: 150 });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [editModalState, setEditModalState] = useState<EditModalState>({
    isOpen: false, entityType: 'NPC', entityId: '', currentName: '', currentImage: undefined,
  });
  const [currentTool, setCurrentTool] = useState<ToolType | null>(null);

  const { isHorizontal, toggleLayout, setLayout } = useLayoutToggle(
    updateNodeLayout,
    (newIsHorizontal) => { console.log("[App] Direction changed:", newIsHorizontal ? 'horizontal' : 'vertical'); },
    true,
    true
  );

  const prefersDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const { isDarkMode, toggleTheme } = useThemeToggle(prefersDarkMode);

  const triggerFitView = useCallback(() => {
    fitViewRef.current?.();
  }, []);

  const toggleDataManagement = useCallback(() => {
    setIsDataManagementVisible(prev => !prev);
    if (!isDataManagementVisible) setIsLayoutOptionsOpen(false);
  }, [isDataManagementVisible]);

  const toggleLayoutOptions = useCallback(() => {
      setIsLayoutOptionsOpen(prev => !prev);
      if (!isLayoutOptionsOpen) setIsDataManagementVisible(false);
  }, [isLayoutOptionsOpen]);

  const handleDataImported = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleFitViewInitialized = useCallback((fitViewFn: () => void) => {
    fitViewRef.current = fitViewFn;
  }, []);

  const handleToolChange = useCallback((tool: ToolType | null) => {
      setCurrentTool(tool);
      console.log("Selected tool:", tool);
  }, []);

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
       if (imageDataUrl !== undefined) {
         updateNpcImage(entityId, imageDataUrl || undefined);
       }
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

  const applyLayoutAndClose = useCallback(() => {
    setPositioningMode('dagre');
    const currentNodes = useDialogueStore.getState().activeNodes();
    const currentEdges = useDialogueStore.getState().activeEdges();
    const dagreDirection = isHorizontal ? 'LR' : 'TB';
    const newPositions = calculateDagreLayout(currentNodes, currentEdges, dagreDirection, layoutOptions.spacing);
     if (Object.keys(newPositions).length > 0) {
         updateNodePositions(newPositions);
     }
    setIsLayoutOptionsOpen(false);
    setTimeout(triggerFitView, 150);
  }, [layoutOptions.spacing, isHorizontal, updateNodePositions, triggerFitView]);

  const handleSetDirection = useCallback((horizontal: boolean) => {
    setLayout(horizontal);
    setTimeout(triggerFitView, 150);
  }, [setLayout, triggerFitView]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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

   useEffect(() => {
     if (isLoading || activeNodesLength === 0) {
       return;
     }
   }, [
       isLoading,
       selectedConversationId,
       isHorizontal,
       activeNodesLength,
       activeEdgesLength,
     ]);

  return (
    <div className={`w-screen h-screen relative overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <DatabaseManager />

      {isLoading && (
         <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mb-3"></div>
                <p className="text-white text-lg font-medium">Loading Dialogue Data...</p>
            </div>
         </div>
      )}

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <Toolbar
            activeTool={currentTool}
            onToolChange={handleToolChange}
        />
      </div>

      <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {!isLoading && (
          <ReactFlowProvider>
              <DialogueFlow
                isHorizontal={isHorizontal}
                onFitViewInitialized={handleFitViewInitialized}
                currentTool={currentTool}
              />
          </ReactFlowProvider>
        )}
      </div>

      <div className="absolute top-4 right-4 z-30 flex flex-col space-y-3 items-end">
        <div className="flex space-x-3 items-start">
             <NodePositioner onClick={toggleLayoutOptions} />
             <Header
               isDarkMode={isDarkMode}
               onToggleTheme={toggleTheme}
               isDataManagementVisible={isDataManagementVisible}
               onToggleDataManagement={toggleDataManagement}
             />
        </div>

         {isLayoutOptionsOpen && (
            <>
              <div className="w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden z-50 border-2 border-blue-100 dark:border-dark-border transition-colors duration-300">
                  <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                      Layout Options
                    </h3>
                  </div>

                  <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                      Direction
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetDirection(true)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm ${
                          isHorizontal
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium'
                            : 'bg-gray-100 text-gray-700 dark:bg-dark-bg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ArrowRight size={16} />
                        <span>Horizontal</span>
                      </button>
                      <button
                        onClick={() => handleSetDirection(false)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm ${
                          !isHorizontal
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium'
                            : 'bg-gray-100 text-gray-700 dark:bg-dark-bg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <ArrowDown size={16} />
                        <span>Vertical</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                    <button
                      onClick={applyLayoutAndClose}
                      className="w-full py-3 px-4 flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100
                              dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200
                              rounded-md transition-colors"
                    >
                      <GitFork size={18} />
                      <div className="text-left">
                        <div className="font-medium">Smart Layout</div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-300">Apply automatic Dagre layout</div>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                        Node Spacing
                      </label>
                      <div className="flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="300"
                          value={layoutOptions.spacing}
                          onChange={(e) => {
                            setLayoutOptions({ spacing: Number(e.target.value) });
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 w-8">{layoutOptions.spacing}px</span>
                      </div>
                    </div>
                  </div>
              </div>

              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLayoutOptionsOpen(false)}
              />
            </>
         )}

         {isDataManagementVisible && (
           <DataActions onDataImported={handleDataImported} />
         )}
         <NodeInfoPanel />
      </div>

      <div className="absolute top-4 left-4 z-20">
         <CardSidebar
            onOpenInfoModal={handleOpenInfoModal}
            onOpenEditModal={handleOpenEditModal}
         />
      </div>

      <AutoSaveIndicator />

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