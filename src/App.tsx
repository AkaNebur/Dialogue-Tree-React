// File: src/App.tsx
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ArrowDown, ArrowRight, GitFork } from 'lucide-react';

import useNpcLayoutToggle from './hooks/useNpcLayoutToggle';

import DialogueFlow from './components/DialogueFlow';
import Header from './components/Header';
import CardSidebar from './components/CardSidebar';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import DataActions from './components/DataActions';
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

interface EditModalState {
  isOpen: boolean;
  entityType: 'NPC' | 'Dialogue';
  entityId: string;
  currentName: string;
  currentImage?: string;
  currentAccentColor?: string;
}

const App: React.FC = () => {
  const fitViewRef = useRef<(() => void) | null>(null);

  const loadInitialData = useDialogueStore(state => state.loadInitialData);
  const updateNodePositions = useDialogueStore(state => state.updateNodePositions);
  const updateNodeLayout = useDialogueStore(state => state.updateNodeLayout);
  const isLoading = useDialogueStore(state => state.isLoading);
  const selectedConversationId = useDialogueStore(state => state.selectedConversationId);
  const activeNodesLength = useDialogueStore(state => state.activeNodes().length);
  const selectedNpc = useDialogueStore(state => state.selectedNpc());

  const {
      deleteNpc,
      deleteConversation,
      updateNpcName,
      updateConversationName,
      updateNpcImage,
      updateNpcAccentColor,
  } = useSidebarData();

  const [isDataManagementVisible, setIsDataManagementVisible] = useState<boolean>(false);
  const [isLayoutOptionsOpen, setIsLayoutOptionsOpen] = useState<boolean>(false);
  const [, setPositioningMode] = useState<PositioningMode>('dagre');
  const [layoutOptions, setLayoutOptions] = useState({ spacing: 150 });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [editModalState, setEditModalState] = useState<EditModalState>({
    isOpen: false, entityType: 'NPC', entityId: '', currentName: '', currentImage: undefined, currentAccentColor: undefined,
  });
  const [currentTool, setCurrentTool] = useState<ToolType | null>(null);

  const { isHorizontal, setLayout } = useNpcLayoutToggle();

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

  const handleOpenEditModal = useCallback((type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => {
      setEditModalState({ isOpen: true, entityType: type, entityId: id, currentName: name, currentImage: image, currentAccentColor: accentColor });
  }, []);

  const handleCloseEditModal = useCallback(() => { setEditModalState(prev => ({ ...prev, isOpen: false })); }, []);

  const handleSaveChanges = useCallback((newName: string, imageDataUrl?: string, newColor?: string) => {
    const { entityType, entityId } = editModalState;
    if (!entityId) return;

    if (entityType === 'NPC') {
       updateNpcName(entityId, newName);
       if (imageDataUrl !== undefined) {
         updateNpcImage(entityId, imageDataUrl || undefined);
       }
       if (newColor) {
           updateNpcAccentColor(entityId, newColor);
       }
    } else if (entityType === 'Dialogue') {
       updateConversationName(entityId, newName);
    }
    handleCloseEditModal();
  }, [editModalState, updateNpcName, updateNpcImage, updateConversationName, updateNpcAccentColor, handleCloseEditModal]);

  const handleDeleteEntity = useCallback(() => {
    const { entityType, entityId } = editModalState;
    if (!entityId) return;

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
    if (currentNodes.length === 0) {
        setIsLayoutOptionsOpen(false);
        return;
    }
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
       activeNodesLength
     ]);

  return (
    <div className="w-screen h-screen relative overflow-hidden border-0 dark">
      {isLoading && (
         <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-gray-400 border-t-transparent rounded-full mb-3"></div>
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

      <div className={`w-full h-full transition-opacity duration-300 ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
        <Header
          onToggleLayoutOptions={toggleLayoutOptions}
        />

         {isLayoutOptionsOpen && (
            <>
              <div className="w-64 bg-[var(--color-surface)] rounded-2xl shadow-lg overflow-hidden z-50 border-2 border-[var(--color-border)] transition-colors duration-300">
                  <div className="p-4 border-b border-[var(--color-border)]">
                    <h3 className="text-md font-semibold text-[var(--color-text)]">
                      Layout Options for NPC
                    </h3>
                    {selectedNpc ? (
                      <p className="text-sm text-gray-300 mt-1">
                        {selectedNpc.name}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-1">
                        No NPC selected
                      </p>
                    )}
                  </div>

                  {selectedNpc ? (
                    <>
                      <div className="p-4 border-b border-[var(--color-border)]">
                        <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase">
                          Direction
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSetDirection(true)}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                              isHorizontal
                                ? 'bg-gray-900 text-gray-200 font-medium ring-1 ring-gray-700' 
                                : 'bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-gray-800'
                            }`}
                            disabled={!selectedNpc}
                          >
                            <ArrowRight size={16} />
                            <span>Horizontal</span>
                          </button>
                          <button
                            onClick={() => handleSetDirection(false)}
                            className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                              !isHorizontal
                                ? 'bg-gray-900 text-gray-200 font-medium ring-1 ring-gray-700'
                                : 'bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-gray-800'
                            }`}
                            disabled={!selectedNpc}
                          >
                            <ArrowDown size={16} />
                            <span>Vertical</span>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Each NPC maintains its own layout preference.
                        </p>
                      </div>

                      <div className="p-4 border-b border-[var(--color-border)]">
                        <button
                          onClick={applyLayoutAndClose}
                          className="w-full py-3 px-4 flex items-center gap-2
                                  bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-200
                                  rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)]"
                          title="Automatically arrange nodes using Dagre algorithm"
                          disabled={!selectedNpc}
                        >
                          <GitFork size={18} />
                          <div className="text-left">
                            <div className="font-medium">Smart Layout</div>
                            <div className="text-xs text-yellow-300">Apply automatic layout</div>
                          </div>
                        </button>
                      </div>

                      <div className="p-4">
                        <label htmlFor='node-spacing-range' className="block text-xs font-medium text-gray-400 mb-2 uppercase">
                          Node Spacing
                        </label>
                        <div className="flex items-center">
                          <input
                            id='node-spacing-range'
                            type="range"
                            min="50"
                            max="300"
                            step="10"
                            value={layoutOptions.spacing}
                            onChange={(e) => setLayoutOptions({ spacing: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)]"
                            disabled={!selectedNpc}
                          />
                          <span className="ml-3 text-xs text-gray-400 w-8 text-right">{layoutOptions.spacing}px</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="text-sm text-gray-400">
                        Please select an NPC to customize its layout options.
                      </div>
                    </div>
                  )}
              </div>

              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsLayoutOptionsOpen(false)}
              />
            </>
         )}

         <NodeInfoPanel />
      </div>

      <div className="absolute top-4 left-4 z-20">
         <CardSidebar
            onOpenInfoModal={handleOpenInfoModal}
            onOpenEditModal={handleOpenEditModal}
            isDataManagementVisible={isDataManagementVisible}
            onToggleDataManagement={toggleDataManagement}
            betweenHeaderAndContent={
              isDataManagementVisible ? (
                <DataActions onDataImported={handleDataImported} />
              ) : null
            }
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
        currentAccentColor={editModalState.currentAccentColor}
        entityType={editModalState.entityType}
      />
    </div>
  );
};

export default App;