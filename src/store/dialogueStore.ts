// src/store/dialogueStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer'; // Import Immer middleware
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  Connection,
  NodeChange,
  EdgeChange,
  XYPosition,
} from 'reactflow';
import { debounce } from 'lodash';
import {
  initialNpcs,
  createInitialConversationData,
  DEFAULT_EMPTY_NODES,
  DEFAULT_EMPTY_EDGES,
} from '../constants/initialData';
import {
  DialogueNode,
  DialogueEdge,
  NPC,
  Conversation,
} from '../types';
import { loadAllNpcs, saveAllNpcs } from '../services/dialogueService';
import IdManager from '../utils/IdManager';

interface DialogueState {
  npcs: NPC[];
  selectedNpcId: string | null;
  selectedConversationId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  dbError: string | null;

  // Derived state selectors (remain the same conceptually)
  selectedNpc: () => NPC | undefined;
  selectedConversation: () => Conversation | undefined;
  activeNodes: () => DialogueNode[];
  activeEdges: () => DialogueEdge[];

  // Actions
  loadInitialData: () => Promise<void>;
  triggerSave: (immediate?: boolean) => Promise<void>;

  addNpc: (name: string) => void;
  selectNpc: (npcId: string) => void;
  deleteNpc: (npcId: string) => void;
  updateNpcName: (npcId: string, newName: string) => void;
  updateNpcImage: (npcId: string, imageDataUrl: string | undefined) => void;

  addConversation: (npcId: string, name: string) => void;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateConversationName: (conversationId: string, newName: string) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodesOrUpdater: DialogueNode[] | ((nodes: DialogueNode[]) => DialogueNode[])) => void;
  setEdges: (edgesOrUpdater: DialogueEdge[] | ((edges: DialogueEdge[]) => DialogueEdge[])) => void;
  updateNodePositions: (positions: { [nodeId: string]: XYPosition }) => void;
  updateNodeLayout: (isHorizontal: boolean) => void;
}

let debouncedSave: ReturnType<typeof debounce<() => Promise<void>>> | null = null;

// Separate performSave function - it receives the whole state for simplicity
const performSave = async (stateToSave: Pick<DialogueState, 'npcs' | 'isLoading'>, set: (partial: Partial<DialogueState>) => void) => {
    if (stateToSave.isLoading) return;
    console.log('[Store] Performing save...');
    set({ isSaving: true }); // Use regular set here, not Immer draft
    try {
        await saveAllNpcs(stateToSave.npcs);
        set({ lastSaved: new Date(), isSaving: false, dbError: null }); // Use regular set
        console.log('[Store] Save successful.');
    } catch (error: any) {
        console.error('[Store] Auto-save failed:', error);
        set({ isSaving: false, dbError: `Save failed: ${error?.message || error}` }); // Use regular set
    }
};


const initializeDebouncedSave = (get: () => DialogueState, set: (partial: Partial<DialogueState>) => void) => {
    if (!debouncedSave) {
        debouncedSave = debounce(async () => {
            // Pass the necessary parts of the state to performSave
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, set);
        }, 1500);
    }
    return debouncedSave;
};

// Wrap the creator function with immer middleware
export const useDialogueStore = create(
  immer<DialogueState>((set, get) => {

    const debouncedSaveFn = initializeDebouncedSave(get, (partial) => set(state => ({...state, ...partial})) ); // Pass a non-Immer set to the saver

    const triggerSave = async (immediate = false) => {
        if (immediate) {
            console.log('[Store] Immediate save triggered.');
            debouncedSaveFn.cancel();
            // Pass necessary state to performSave for immediate execution
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, (partial) => set(state => ({...state, ...partial})) );
        } else {
            debouncedSaveFn();
        }
    };

    // Helper to find indices - useful within Immer actions
    const findIndices = (state: DialogueState) => {
        const npcIndex = state.npcs.findIndex(npc => npc.id === state.selectedNpcId);
        if (npcIndex === -1) return { npcIndex: -1, convIndex: -1 };
        const convIndex = state.npcs[npcIndex].conversations.findIndex(conv => conv.id === state.selectedConversationId);
        return { npcIndex, convIndex };
    };

    return {
      npcs: [],
      selectedNpcId: null,
      selectedConversationId: null,
      isLoading: true,
      isSaving: false,
      lastSaved: null,
      dbError: null,

      // --- Derived State Selectors ---
      selectedNpc: () => get().npcs.find((npc) => npc.id === get().selectedNpcId),
      selectedConversation: () => get().selectedNpc()?.conversations.find((conv) => conv.id === get().selectedConversationId),
      activeNodes: () => get().selectedConversation()?.nodes || DEFAULT_EMPTY_NODES,
      activeEdges: () => get().selectedConversation()?.edges || DEFAULT_EMPTY_EDGES,

      // --- Actions using Immer Draft ---
      loadInitialData: async () => {
        // Modify non-nested state directly with set is fine here
        set({ isLoading: true, dbError: null });
        try {
          console.log("[Store] Loading initial data...");
          const loadedNpcs = await loadAllNpcs();
          console.log(`[Store] Loaded ${loadedNpcs.length} NPCs.`);

          try {
              console.log("[Store] Syncing IdManager with loaded data...");
              IdManager.syncWithData(loadedNpcs);
              console.log("[Store] IdManager synced.");
          } catch (syncError: any) {
              console.error("[Store] Error syncing IdManager:", syncError);
              // Use Immer set to update state within the async action
              set(draft => {
                  draft.dbError = `Failed to sync ID Manager: ${syncError?.message || syncError}`;
              });
          }

          let initialNpcId: string | null = null;
          let initialConvId: string | null = null;

          if (loadedNpcs.length > 0) {
            initialNpcId = loadedNpcs[0].id;
            if (loadedNpcs[0].conversations.length > 0) {
              initialConvId = loadedNpcs[0].conversations[0].id;
            }
          }

          // Use Immer set to update multiple state properties
          set(draft => {
            draft.npcs = loadedNpcs;
            draft.selectedNpcId = initialNpcId;
            draft.selectedConversationId = initialConvId;
            draft.isLoading = false;
            draft.lastSaved = new Date();
            draft.dbError = draft.dbError || null; // Preserve potential sync error
          });
          console.log("[Store] Initial data loaded and state set.");

        } catch (error: any) {
          console.error('[Store] Error loading data:', error);
          try {
            IdManager.syncWithData(initialNpcs);
          } catch (syncError: any) {
             console.error("[Store] Error syncing IdManager with fallback:", syncError);
          }
          set(draft => {
            draft.npcs = initialNpcs;
            draft.selectedNpcId = null;
            draft.selectedConversationId = null;
            draft.isLoading = false;
            draft.dbError = `Failed to load data: ${error?.message || error}`;
          });
        }
      },

      // triggerSave doesn't modify state directly, just calls the debounced function
      triggerSave: triggerSave,

      addNpc: (name) => {
        const newNpcId = IdManager.generateNpcId();
        const newConversationId = IdManager.generateConversationId();
        const newNpc: NPC = {
          id: newNpcId,
          name: name || `New NPC ${newNpcId.split('-')[1]}`,
          conversations: [
            {
              id: newConversationId,
              name: 'Default Conversation',
              ...createInitialConversationData('Default Conversation'),
            },
          ],
        };
        set(draft => {
          draft.npcs.push(newNpc);
          draft.selectedNpcId = newNpcId;
          draft.selectedConversationId = newConversationId;
        });
        triggerSave();
      },

      selectNpc: (npcId) => {
        const npc = get().npcs.find(n => n.id === npcId);
        if (npc) {
          set(draft => {
            draft.selectedNpcId = npcId;
            draft.selectedConversationId = npc.conversations[0]?.id || null;
          });
        }
      },

      deleteNpc: (npcId) => {
        if (!npcId) return;
        const currentSelectedNpcId = get().selectedNpcId;
        let nextSelectedNpcId: string | null = null;
        let nextSelectedConvId: string | null = null;

        const npcIndex = get().npcs.findIndex((npc) => npc.id === npcId);
        if (npcIndex === -1) return;

        set(draft => {
            const deletedNpc = draft.npcs.splice(npcIndex, 1)[0]; // Remove using splice

            if (deletedNpc.id === currentSelectedNpcId) {
                nextSelectedNpcId = draft.npcs[0]?.id || null;
                nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
            } else {
                nextSelectedNpcId = currentSelectedNpcId;
                nextSelectedConvId = draft.selectedConversationId;
                // Verify the previously selected conversation still exists
                const currentNpcStillExists = draft.npcs.find((n: { id: string; }) => n.id === nextSelectedNpcId);
                if (!currentNpcStillExists?.conversations.some((c: { id: string | null; }) => c.id === nextSelectedConvId)) {
                    nextSelectedConvId = currentNpcStillExists?.conversations[0]?.id || null;
                }
            }
            draft.selectedNpcId = nextSelectedNpcId;
            draft.selectedConversationId = nextSelectedConvId;
        });
        triggerSave();
      },

      updateNpcName: (npcId, newName) => {
        if (!npcId || !newName.trim()) return;
        set(draft => {
            const npc = draft.npcs.find((npc: { id: string; }) => npc.id === npcId);
            if (npc) {
                npc.name = newName.trim();
            }
        });
        triggerSave();
      },

      updateNpcImage: (npcId, imageDataUrl) => {
        if (!npcId) return;
        set(draft => {
            const npc = draft.npcs.find((npc: { id: string; }) => npc.id === npcId);
            if (npc) {
                npc.image = imageDataUrl;
            }
        });
        triggerSave();
      },

      addConversation: (npcId, name) => {
        if (!npcId) return;
        const newConversationId = IdManager.generateConversationId();
        const newName = name || `New Conversation ${newConversationId.split('-')[1]}`;
        const newConversation: Conversation = {
          id: newConversationId,
          name: newName,
          ...createInitialConversationData(newName),
        };
        set(draft => {
            const npc = draft.npcs.find((npc: { id: string; }) => npc.id === npcId);
            if (npc) {
                npc.conversations.push(newConversation);
                draft.selectedConversationId = newConversationId; // Select the new one
            }
        });
        triggerSave();
      },

      selectConversation: (conversationId) => {
         const npc = get().selectedNpc();
         if (npc && npc.conversations.some(c => c.id === conversationId)) {
             set(draft => { draft.selectedConversationId = conversationId });
         } else {
             console.warn(`Attempted to select conversation ${conversationId} which does not exist on NPC ${get().selectedNpcId}`);
             set(draft => { draft.selectedConversationId = npc?.conversations[0]?.id || null });
         }
      },

      deleteConversation: (conversationId) => {
        const npcId = get().selectedNpcId;
        if (!conversationId || !npcId) return;

        const { npcIndex } = findIndices(get());
        if (npcIndex === -1) return;

        // Check if it's the last conversation
        if (get().npcs[npcIndex].conversations.length <= 1) {
             console.warn("Cannot delete the last conversation for an NPC");
             return;
        }

        set(draft => {
            const convIndex = draft.npcs[npcIndex].conversations.findIndex((c: { id: string; }) => c.id === conversationId);
            if (convIndex !== -1) {
                const deletedConvId = draft.npcs[npcIndex].conversations[convIndex].id;
                draft.npcs[npcIndex].conversations.splice(convIndex, 1); // Remove conversation

                // If the deleted one was selected, select the first remaining one
                if (deletedConvId === draft.selectedConversationId) {
                    draft.selectedConversationId = draft.npcs[npcIndex].conversations[0]?.id || null;
                }
            }
        });
        triggerSave();
      },

      updateConversationName: (conversationId, newName) => {
        const npcId = get().selectedNpcId;
        if (!conversationId || !newName.trim() || !npcId) return;
        const finalName = newName.trim();

        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                conv.name = finalName;
                // Update start node label if it exists
                const startNode = conv.nodes?.find((node: DialogueNode) => node.type === 'input' && node.data.label.startsWith('Start:'));
                if (startNode) {
                    startNode.data.label = `Start: ${finalName}`;
                }
            }
        });
        triggerSave();
      },

      onNodesChange: (changes) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                conv.nodes = applyNodeChanges(changes, conv.nodes || []);
            }
        });
        triggerSave(); // Note: React Flow applies changes, so this might trigger frequent saves. Debounce handles it.
      },

      onEdgesChange: (changes) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                conv.edges = applyEdgeChanges(changes, conv.edges || []);
            }
        });
        triggerSave();
      },

      onConnect: (connection) => {
        const { npcIndex, convIndex } = findIndices(get());
        if (npcIndex === -1 || convIndex === -1 || connection.source === connection.target) return;

        set(draft => {
            const conv = draft.npcs[npcIndex].conversations[convIndex];
            const uniqueConnection = { ...connection, id: `e${connection.source}-${connection.target}-${Date.now()}` };
            conv.edges = addEdge(uniqueConnection, conv.edges || []);
        });
        triggerSave();
      },

      setNodes: (nodesOrUpdater) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 conv.nodes = typeof nodesOrUpdater === 'function'
                   ? nodesOrUpdater(conv.nodes || [])
                   : nodesOrUpdater;
             }
         });
         triggerSave();
      },

      setEdges: (edgesOrUpdater) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 conv.edges = typeof edgesOrUpdater === 'function'
                   ? edgesOrUpdater(conv.edges || [])
                   : edgesOrUpdater;
             }
         });
         triggerSave();
      },

      updateNodePositions: (positions) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.nodes) return;
                 conv.nodes.forEach((node: { id: string | number; position: XYPosition; }) => {
                     if (positions[node.id]) {
                         node.position = positions[node.id];
                     }
                 });
             }
         });
         triggerSave();
      },

      updateNodeLayout: (isHorizontal) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.nodes) return;
                 conv.nodes.forEach((node: DialogueNode) => {
                     node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
                     node.targetPosition = isHorizontal ? Position.Left : Position.Top;
                 });
             }
         });
         triggerSave();
      },
    };
  }) // End of immer middleware wrapper
); // End of create

// Selectors remain the same as they only read state
export const useSidebarData = () => useDialogueStore((state) => ({
    npcs: state.npcs,
    selectedNpcId: state.selectedNpcId,
    selectedConversationId: state.selectedConversationId,
    selectNpc: state.selectNpc,
    addNpc: state.addNpc,
    deleteNpc: state.deleteNpc,
    selectConversation: state.selectConversation,
    addConversation: state.addConversation,
    deleteConversation: state.deleteConversation,
    updateNpcName: state.updateNpcName,
    updateConversationName: state.updateConversationName,
    updateNpcImage: state.updateNpcImage,
    selectedNpc: state.selectedNpc(), // Call derived state function
}));

export const useFlowData = () => useDialogueStore((state) => ({
    nodes: state.activeNodes(),
    edges: state.activeEdges(),
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
}));

export const useSavingStatus = () => useDialogueStore((state) => ({
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    isLoading: state.isLoading,
    triggerSave: state.triggerSave,
    dbError: state.dbError,
}));