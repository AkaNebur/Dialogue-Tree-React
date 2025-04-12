// File: src/store/dialogueStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  Connection,
  NodeChange,
  EdgeChange,
  XYPosition,
  Node,
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

  // Derived state selectors
  selectedNpc: () => NPC | undefined;
  selectedConversation: () => Conversation | undefined;
  activeNodes: () => DialogueNode[];
  activeEdges: () => DialogueEdge[];
  selectedNodes: () => DialogueNode[];
  getSelectedNodeInfo: () => DialogueNode | null;
  getNodeTypes: () => string[];

  // Actions
  loadInitialData: () => Promise<void>;
  triggerSave: (immediate?: boolean) => Promise<void>;

  // NPC Actions
  addNpc: (name: string) => void;
  selectNpc: (npcId: string) => void;
  deleteNpc: (npcId: string) => void;
  updateNpcName: (npcId: string, newName: string) => void;
  updateNpcImage: (npcId: string, imageDataUrl: string | undefined) => void;

  // Conversation Actions
  addConversation: (npcId: string, name: string) => void;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateConversationName: (conversationId: string, newName: string) => void;

  // React Flow Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodesOrUpdater: DialogueNode[] | ((nodes: DialogueNode[]) => DialogueNode[])) => void;
  setEdges: (edgesOrUpdater: DialogueEdge[] | ((edges: DialogueEdge[]) => DialogueEdge[])) => void;
  updateNodePositions: (positions: { [nodeId: string]: XYPosition }) => void;
  updateNodeLayout: (isHorizontal: boolean) => void;
  updateNodeData: (nodeId: string, newLabel: string) => void; // For label/title
  updateNodeText: (nodeId: string, newText: string) => void; // For body text
  updateNodeType: (nodeId: string, newType: string) => void; // Action to update node type
}

let debouncedSave: ReturnType<typeof debounce<() => Promise<void>>> | null = null;

const performSave = async (stateToSave: Pick<DialogueState, 'npcs' | 'isLoading'>, set: (partial: Partial<DialogueState>) => void) => {
    if (stateToSave.isLoading) return;
    console.log('[Store] Performing save...');
    set({ isSaving: true });
    try {
        await saveAllNpcs(stateToSave.npcs);
        set({ lastSaved: new Date(), isSaving: false, dbError: null });
        console.log('[Store] Save successful.');
    } catch (error: any) {
        console.error('[Store] Auto-save failed:', error);
        set({ isSaving: false, dbError: `Save failed: ${error?.message || error}` });
    }
};

const initializeDebouncedSave = (get: () => DialogueState, set: (partial: Partial<DialogueState>) => void) => {
    if (!debouncedSave) {
        debouncedSave = debounce(async () => {
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, set);
        }, 1500);
    }
    return debouncedSave;
};

export const useDialogueStore = create(
  immer<DialogueState>((set, get) => {

    const debouncedSaveFn = initializeDebouncedSave(get, (partial) => set(state => ({...state, ...partial})) );

    const triggerSave = async (immediate = false) => {
        if (immediate) {
            console.log('[Store] Immediate save triggered.');
            debouncedSaveFn.cancel();
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, (partial) => set(state => ({...state, ...partial})) );
        } else {
            debouncedSaveFn();
        }
    };

    const findIndices = (state: DialogueState) => {
        const npcIndex = state.npcs.findIndex(npc => npc.id === state.selectedNpcId);
        if (npcIndex === -1) return { npcIndex: -1, convIndex: -1 };
        const convIndex = state.npcs[npcIndex]?.conversations.findIndex(conv => conv.id === state.selectedConversationId) ?? -1;
        return { npcIndex, convIndex };
    };

    return {
      // --- State ---
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
      selectedNodes: () => get().activeNodes().filter(node => node.selected),
      getSelectedNodeInfo: () => {
        const selected = get().selectedNodes();
        return selected.length === 1 ? selected[0] : null;
      },
      getNodeTypes: () => {
        return ['npc', 'user', 'custom'];
      },

      // --- Actions ---
      loadInitialData: async () => {
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

          set(draft => {
            draft.npcs = loadedNpcs;
            draft.selectedNpcId = initialNpcId;
            draft.selectedConversationId = initialConvId;
            draft.isLoading = false;
            draft.lastSaved = new Date();
            draft.dbError = draft.dbError || null;
          });
          console.log("[Store] Initial data loaded and state set.");

        } catch (error: any) {
          console.error('[Store] Error loading data:', error);
          try { IdManager.syncWithData(initialNpcs); } catch (syncError: any) { console.error("[Store] Error syncing IdManager with fallback:", syncError); }
          set(draft => {
            draft.npcs = initialNpcs;
            draft.selectedNpcId = null;
            draft.selectedConversationId = null;
            draft.isLoading = false;
            draft.dbError = `Failed to load data: ${error?.message || error}`;
          });
        }
      },

      triggerSave: triggerSave,

      addNpc: (name) => {
        const newNpcId = IdManager.generateNpcId();
        const newConversationId = IdManager.generateConversationId();
        const conversationName = 'Default Conversation';
        const newNpc: NPC = {
          id: newNpcId,
          name: name?.trim() || `New NPC ${newNpcId.split('-')[1]}`,
          image: undefined,
          conversations: [
            {
              id: newConversationId,
              name: conversationName,
              ...createInitialConversationData(conversationName),
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
        if (npcId !== get().selectedNpcId) {
          const npc = get().npcs.find(n => n.id === npcId);
          if (npc) {
            set(draft => {
              draft.selectedNpcId = npcId;
              draft.selectedConversationId = npc.conversations[0]?.id || null;
            });
          }
        }
      },

      deleteNpc: (npcId) => {
        if (!npcId) return;
        const currentSelectedNpcId = get().selectedNpcId;
        const currentSelectedConvId = get().selectedConversationId;
        let nextSelectedNpcId: string | null = null;
        let nextSelectedConvId: string | null = null;

        set(draft => {
            const npcIndex = draft.npcs.findIndex((npc) => npc.id === npcId);
            if (npcIndex === -1) return;

            const deletedNpc = draft.npcs.splice(npcIndex, 1)[0];

            if (deletedNpc.id === currentSelectedNpcId) {
                nextSelectedNpcId = draft.npcs[0]?.id || null;
                nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
            } else {
                nextSelectedNpcId = currentSelectedNpcId;
                nextSelectedConvId = currentSelectedConvId;
                 const currentNpcStillExists = draft.npcs.find(n => n.id === nextSelectedNpcId);
                 if (!currentNpcStillExists) {
                     nextSelectedNpcId = draft.npcs[0]?.id || null;
                     nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
                 } else if (!currentNpcStillExists.conversations.some(c => c.id === nextSelectedConvId)) {
                     nextSelectedConvId = currentNpcStillExists.conversations[0]?.id || null;
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
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) { npc.name = newName.trim(); }
        });
        triggerSave();
      },

      updateNpcImage: (npcId, imageDataUrl) => {
        if (!npcId) return;
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) { npc.image = imageDataUrl; }
        });
        triggerSave();
      },

      addConversation: (npcId, name) => {
        if (!npcId) return;
        const newConversationId = IdManager.generateConversationId();
        const newName = name?.trim() || `New Conversation ${newConversationId.split('-')[1]}`;
        const newConversation: Conversation = {
          id: newConversationId,
          name: newName,
          ...createInitialConversationData(newName),
        };
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) {
                npc.conversations.push(newConversation);
                draft.selectedConversationId = newConversationId;
            }
        });
        triggerSave();
      },

      selectConversation: (conversationId) => {
         if (conversationId !== get().selectedConversationId) {
             const npc = get().selectedNpc();
             if (npc && npc.conversations.some(c => c.id === conversationId)) {
                 set(draft => { draft.selectedConversationId = conversationId });
             } else {
                 console.warn(`Attempted to select conversation ${conversationId} which does not exist or isn't loaded on NPC ${get().selectedNpcId}`);
             }
         }
      },

      deleteConversation: (conversationId) => {
        const npcId = get().selectedNpcId;
        if (!conversationId || !npcId) return;

        set(draft => {
            const npcIndex = draft.npcs.findIndex(n => n.id === npcId);
            if (npcIndex === -1) return;

            const npc = draft.npcs[npcIndex];
            if (npc.conversations.length <= 1) {
                console.warn("Cannot delete the last conversation for an NPC.");
                return;
            }

            const convIndex = npc.conversations.findIndex((c: Conversation) => c.id === conversationId);
            if (convIndex !== -1) {
                const deletedConvId = npc.conversations[convIndex].id;
                npc.conversations.splice(convIndex, 1);
                if (deletedConvId === draft.selectedConversationId) {
                    draft.selectedConversationId = npc.conversations[0]?.id || null;
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
                const startNode = conv.nodes?.find((node: DialogueNode) => node.type === 'input');
                if (startNode) {
                    startNode.data.label = `Start: ${finalName}`;
                }
            }
        });
        triggerSave();
      },

      // Only showing the modified onNodesChange method

      onNodesChange: (changes) => {
        set(draft => {
          const { npcIndex, convIndex } = findIndices(draft);
          if (npcIndex !== -1 && convIndex !== -1) {
            const conv = draft.npcs[npcIndex].conversations[convIndex];
            if (!conv.nodes) conv.nodes = [];
            
            // Filter out any changes that would remove a start/input node
            const safeChanges = changes.filter(change => {
              if (change.type === 'remove') {
                const nodeToRemove = conv.nodes.find(node => node.id === change.id);
                return nodeToRemove?.type !== 'input'; // Only allow removal if not an input node
              }
              return true; // Allow all other types of changes
            });
            
            // Apply the filtered changes
            conv.nodes = applyNodeChanges(safeChanges, conv.nodes);
          }
        });
        triggerSave();
      },
      onEdgesChange: (changes) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.edges) conv.edges = [];
                conv.edges = applyEdgeChanges(changes, conv.edges);
            }
        });
        triggerSave();
      },

      onConnect: (connection) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex === -1 || convIndex === -1) return;
            if (connection.source === connection.target) return;

            const conv = draft.npcs[npcIndex].conversations[convIndex];
             if (!conv.edges) conv.edges = [];

            if (connection.source && connection.target) {
                const uniqueConnection = {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}`
                };
                conv.edges = addEdge(uniqueConnection, conv.edges);
            } else {
                console.warn("Attempted to add edge with missing source or target:", connection);
            }
        });
        triggerSave();
      },

      setNodes: (nodesOrUpdater) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                  if (!conv.nodes) conv.nodes = [];
                 conv.nodes = typeof nodesOrUpdater === 'function'
                   ? nodesOrUpdater(conv.nodes)
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
                 if (!conv.edges) conv.edges = [];
                 conv.edges = typeof edgesOrUpdater === 'function'
                   ? edgesOrUpdater(conv.edges)
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
                 conv.nodes.forEach((node: Node) => {
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

      updateNodeData: (nodeId, newLabel) => {
        if (!nodeId || !newLabel.trim()) return;
        set(draft => {
          const { npcIndex, convIndex } = findIndices(draft);
          if (npcIndex !== -1 && convIndex !== -1) {
            const node = draft.npcs[npcIndex].conversations[convIndex].nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              node.data = { ...node.data, label: newLabel.trim() };
              console.log(`[Store] Updated label for node ${nodeId} to "${node.data.label}"`);
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update label.`);
            }
          }
        });
        triggerSave();
      },

      updateNodeText: (nodeId, newText) => {
        if (!nodeId) return; // Allow empty text
        set(draft => {
          const { npcIndex, convIndex } = findIndices(draft);
          if (npcIndex !== -1 && convIndex !== -1) {
            const node = draft.npcs[npcIndex].conversations[convIndex].nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              node.data = { ...node.data, text: newText }; // Update text, allow empty
              console.log(`[Store] Updated text for node ${nodeId}`);
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update text.`);
            }
          }
        });
        triggerSave();
      },

      updateNodeType: (nodeId, newType) => {
        if (!nodeId || !newType) return;
        set(draft => {
          const { npcIndex, convIndex } = findIndices(draft);
          if (npcIndex !== -1 && convIndex !== -1) {
            const node = draft.npcs[npcIndex].conversations[convIndex].nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              node.type = newType;
              console.log(`[Store] Updated type for node ${nodeId} to "${newType}"`);
            } else {
                console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update type.`);
            }
          }
        });
        triggerSave();
      }
    };
  })
);

// --- Custom Hooks for Selecting State Slices ---

export const useNodeInfoPanelData = () => useDialogueStore((state) => ({
    selectedNode: state.getSelectedNodeInfo(),
    updateNodeData: state.updateNodeData,
    updateNodeText: state.updateNodeText,         // Action to update node text
    updateNodeType: state.updateNodeType,       // Action to update node type
    availableNodeTypes: state.getNodeTypes(), // List of available types
}));

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
    selectedNpc: state.selectedNpc(),
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