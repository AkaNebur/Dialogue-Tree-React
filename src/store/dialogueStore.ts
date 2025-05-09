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
import { arrayMove } from '@dnd-kit/sortable';
import { SelectOption } from '../components/ui/Select'; // Import SelectOption type
import {
  initialNpcs,
  createInitialConversationData,
  DEFAULT_EMPTY_NODES,
  DEFAULT_EMPTY_EDGES,
  DEFAULT_NPC_ACCENT_COLOR,
  DEFAULT_NPC_LAYOUT_HORIZONTAL,
  getNextNodeId,
} from '../constants/initialData';
import {
  DialogueNode,
  DialogueEdge,
  NPC,
  Conversation,
} from '../types';
import { loadAllNpcs, saveAllNpcs } from '../services/dialogueService';
import IdManager from '../utils/IdManager';
// Note: Icon import removed as it's not directly used in the store logic itself

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
  getNpcListForDropdown: () => SelectOption[];
  getAllConversationsForDropdown: () => SelectOption[]; // Selector for jump node target

  // Actions
  loadInitialData: () => Promise<void>;
  triggerSave: (immediate?: boolean) => Promise<void>;

  // NPC Actions
  addNpc: (name: string) => void;
  selectNpc: (npcId: string) => void;
  deleteNpc: (npcId: string) => void;
  updateNpcName: (npcId: string, newName: string) => void;
  updateNpcImage: (npcId: string, imageDataUrl: string | undefined) => void;
  updateNpcAccentColor: (npcId: string, color: string) => void;
  updateNpcLayoutDirection: (npcId: string, isHorizontal: boolean) => void;
  reorderNpcs: (oldIndex: number, newIndex: number) => void;

  // Conversation Actions
  addConversation: (npcId: string, name: string) => void;
  selectConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  updateConversationName: (conversationId: string, newName: string) => void;
  reorderConversations: (npcId: string, oldIndex: number, newIndex: number) => void;

  // React Flow Actions
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setNodes: (nodesOrUpdater: DialogueNode[] | ((nodes: DialogueNode[]) => DialogueNode[])) => void;
  setEdges: (edgesOrUpdater: DialogueEdge[] | ((edges: DialogueEdge[]) => DialogueEdge[])) => void;
  updateNodePositions: (positions: { [nodeId: string]: XYPosition }) => void;
  updateNodeLayout: (isHorizontal: boolean) => void;
  updateNodeData: (nodeId: string, newLabel: string) => void;
  updateNodeText: (nodeId: string, newText: string) => void;
  updateNodeType: (nodeId: string, newType: string) => void;
  updateNodeNpcId: (nodeId: string, npcId: string | undefined) => void;
  updateNodeTargetConversation: (nodeId: string, targetNpcId: string | undefined, targetConversationId: string | undefined) => void; // Action for jump node target
  jumpToConversation: (targetNpcId: string, targetConversationId: string) => void; // Action to perform the jump
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

    const getCurrentConversation = (draft: DialogueState): Conversation | undefined => {
      const { npcIndex, convIndex } = findIndices(draft);
      if (npcIndex === -1 || convIndex === -1) return undefined;
      return draft.npcs[npcIndex]?.conversations[convIndex];
    };

    return {
      // State
      npcs: [],
      selectedNpcId: null,
      selectedConversationId: null,
      isLoading: true,
      isSaving: false,
      lastSaved: null,
      dbError: null,

      // Derived State Selectors
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
        return ['npc', 'user', 'custom', 'jump']; // Added 'jump' type
      },
      getNpcListForDropdown: () => {
        return get().npcs.map(npc => ({ value: npc.id, label: npc.name }));
      },
      getAllConversationsForDropdown: () => {
        const options: SelectOption[] = [];
        const currentConversationId = get().selectedConversationId;

        get().npcs.forEach(npc => {
          npc.conversations.forEach(conv => {
            const isDisabled = conv.id === currentConversationId; // Prevent jumping to self
            options.push({
              value: `${npc.id}|${conv.id}`, // Combine IDs for easy parsing
              label: `${npc.name} / ${conv.name}`,
              disabled: isDisabled
            });
          });
        });
        return options;
      },

      // Actions
      loadInitialData: async () => {
        set({ isLoading: true, dbError: null });
        try {
          console.log("[Store] Loading initial data...");
          const loadedNpcs = await loadAllNpcs();
          console.log(`[Store] Loaded ${loadedNpcs.length} NPCs.`);

          // Data normalization and default value application
          loadedNpcs.forEach(npc => {
            if (!npc.accentColor) npc.accentColor = DEFAULT_NPC_ACCENT_COLOR;
            if (npc.isHorizontal === undefined) npc.isHorizontal = DEFAULT_NPC_LAYOUT_HORIZONTAL;
            if (!Array.isArray(npc.conversations)) npc.conversations = [];
            npc.conversations.forEach(conv => {
                if (!conv.nodes) conv.nodes = [];
                if (!conv.edges) conv.edges = [];
                // Backfill missing npcId for older NPC nodes
                conv.nodes.forEach(node => {
                    if (node.type === 'npc' && !node.data.npcId) {
                        node.data.npcId = npc.id;
                        console.warn(`[Store Load] Backfilled missing npcId for node ${node.id} in NPC ${npc.id}`);
                    }
                });
            });
          });

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
            draft.dbError = draft.dbError || null; // Preserve potential sync error
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

      // NPC Actions
      addNpc: (name) => {
        const newNpcId = IdManager.generateNpcId();
        const newConversationId = IdManager.generateConversationId();
        const conversationName = 'Default Conversation';
        const newNpc: NPC = {
          id: newNpcId,
          name: name?.trim() || `New NPC ${newNpcId.split('-')[1]}`,
          image: undefined,
          accentColor: DEFAULT_NPC_ACCENT_COLOR,
          isHorizontal: DEFAULT_NPC_LAYOUT_HORIZONTAL,
          conversations: [
            {
              id: newConversationId,
              name: conversationName,
              ...createInitialConversationData(conversationName, DEFAULT_NPC_LAYOUT_HORIZONTAL),
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
                // If deleted NPC was selected, select the first available NPC/Conv
                nextSelectedNpcId = draft.npcs[0]?.id || null;
                nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
            } else {
                // Otherwise, try to keep current selection, but validate it still exists
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

      updateNpcAccentColor: (npcId, color) => {
        if (!npcId || !color) return;
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) {
                npc.accentColor = color;
                console.log(`[Store] Updated accent color for NPC ${npcId} to "${color}"`);
            } else {
                console.warn(`[Store] NPC ${npcId} not found, cannot update accent color.`);
            }
        });
        triggerSave();
      },

      updateNpcLayoutDirection: (npcId, isHorizontal) => {
        if (!npcId) return;
        set(draft => {
          const npc = draft.npcs.find((n) => n.id === npcId);
          if (npc) {
            npc.isHorizontal = isHorizontal;
            console.log(`[Store] Updated layout direction for NPC ${npcId} to ${isHorizontal ? 'horizontal' : 'vertical'}`);

            // Update positions only for the CURRENTLY selected conversation's nodes
            if (npcId === draft.selectedNpcId) {
                const conv = getCurrentConversation(draft);
                if(conv?.nodes) {
                    conv.nodes.forEach((node) => {
                        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
                        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
                    });
                }
            }
          } else {
            console.warn(`[Store] NPC ${npcId} not found, cannot update layout direction.`);
          }
        });
        triggerSave();
      },

      reorderNpcs: (oldIndex, newIndex) => {
        set(draft => {
            if (oldIndex < 0 || oldIndex >= draft.npcs.length || newIndex < 0 || newIndex >= draft.npcs.length) {
              console.warn(`[Store] Invalid indices for reordering NPCs: old=${oldIndex}, new=${newIndex}`);
              return;
            }
            draft.npcs = arrayMove(draft.npcs, oldIndex, newIndex);
            console.log(`[Store] Reordered NPCs.`);
        });
        triggerSave();
      },

      // Conversation Actions
      addConversation: (npcId, name) => {
        if (!npcId) return;
        const newConversationId = IdManager.generateConversationId();
        const newName = name?.trim() || `New Conversation ${newConversationId.split('-')[1]}`;

        set(draft => {
          const npc = draft.npcs.find((n) => n.id === npcId);
          if (npc) {
            const isHorizontal = npc.isHorizontal !== undefined ? npc.isHorizontal : DEFAULT_NPC_LAYOUT_HORIZONTAL;

            const newConversation: Conversation = {
              id: newConversationId,
              name: newName,
              ...createInitialConversationData(newName, isHorizontal),
            };

            if (!Array.isArray(npc.conversations)) {
                npc.conversations = [];
            }
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
                // Optionally provide user feedback here
                return;
            }

            const convIndex = npc.conversations.findIndex((c: Conversation) => c.id === conversationId);
            if (convIndex !== -1) {
                const deletedConvId = npc.conversations[convIndex].id;
                npc.conversations.splice(convIndex, 1);

                // If deleted conversation was selected, select the first remaining one
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
            const conv = getCurrentConversation(draft);
            if (conv) {
                conv.name = finalName;
                // Update the corresponding start node label
                const startNode = conv.nodes?.find((node: DialogueNode) => node.type === 'input');
                if (startNode) {
                    startNode.data.label = `Start: ${finalName}`;
                }
            }
        });
        triggerSave();
      },

      reorderConversations: (npcId, oldIndex, newIndex) => {
        set(draft => {
            const npc = draft.npcs.find(n => n.id === npcId);
            if (!npc) {
                console.warn(`[Store] NPC ${npcId} not found for reordering conversations.`);
                return;
            }
            if (oldIndex < 0 || oldIndex >= npc.conversations.length || newIndex < 0 || newIndex >= npc.conversations.length) {
                console.warn(`[Store] Invalid indices for reordering conversations: old=${oldIndex}, new=${newIndex}`);
                return;
            }
            npc.conversations = arrayMove(npc.conversations, oldIndex, newIndex);
            console.log(`[Store] Reordered conversations for NPC ${npcId}.`);
        });
        triggerSave();
      },

      // React Flow Actions
      onNodesChange: (changes) => {
        set(draft => {
          const conv = getCurrentConversation(draft);
          if (conv) {
            if (!conv.nodes) conv.nodes = [];

            // Prevent deletion of 'input' nodes
            const safeChanges = changes.filter(change => {
              if (change.type === 'remove') {
                const nodeToRemove = conv.nodes.find(node => node.id === change.id);
                return nodeToRemove?.type !== 'input';
              }
              return true;
            });

            conv.nodes = applyNodeChanges(safeChanges, conv.nodes);
          }
        });
        triggerSave();
      },

      onEdgesChange: (changes) => {
        set(draft => {
            const conv = getCurrentConversation(draft);
            if (conv) {
                if (!conv.edges) conv.edges = [];
                conv.edges = applyEdgeChanges(changes, conv.edges);
            }
        });
        triggerSave();
      },

      onConnect: (connection) => {
        set(draft => {
            const conv = getCurrentConversation(draft);
            if (!conv) return;
            if (connection.source === connection.target) return; // Prevent self-connections
            if (!conv.edges) conv.edges = [];

            if (connection.source && connection.target) {
                const uniqueConnection = {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}` // Basic unique ID
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
             const conv = getCurrentConversation(draft);
             if (conv) {
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
             const conv = getCurrentConversation(draft);
             if (conv) {
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
             const conv = getCurrentConversation(draft);
             if (conv?.nodes) {
                 conv.nodes.forEach((node: Node) => { // Ensure type Node for position property
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
            const { npcIndex } = findIndices(draft);
            if (npcIndex !== -1) {
                const npc = draft.npcs[npcIndex];
                npc.isHorizontal = isHorizontal;

                // Update positions only for the CURRENTLY selected conversation's nodes
                const conv = getCurrentConversation(draft);
                if(conv?.nodes) {
                    conv.nodes.forEach((node) => {
                        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
                        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
                    });
                }
            }
         });
         triggerSave();
      },

      updateNodeData: (nodeId, newLabel) => {
        if (!nodeId || !newLabel.trim()) return;
        set(draft => {
            const conv = getCurrentConversation(draft);
            const node = conv?.nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              node.data = { ...node.data, label: newLabel.trim() };
              console.log(`[Store] Updated label for node ${nodeId} to "${node.data.label}"`);
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update label.`);
            }
        });
        triggerSave();
      },

      updateNodeText: (nodeId, newText) => {
        if (!nodeId) return;
        set(draft => {
            const conv = getCurrentConversation(draft);
            const node = conv?.nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              node.data = { ...node.data, text: newText };
              console.log(`[Store] Updated text for node ${nodeId}`);
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update text.`);
            }
        });
        triggerSave();
      },

      updateNodeType: (nodeId, newType) => {
        if (!nodeId || !newType) return;
        set(draft => {
            const conv = getCurrentConversation(draft);
            const node = conv?.nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              const oldType = node.type;
              node.type = newType;
              // Manage npcId when type changes
              if (newType === 'npc' && oldType !== 'npc') {
                 node.data.npcId = draft.selectedNpcId ?? undefined;
                 console.log(`[Store] Set default npcId to ${node.data.npcId} for node ${nodeId}`);
              } else if (newType !== 'npc' && oldType === 'npc') {
                 delete node.data.npcId;
                 console.log(`[Store] Cleared npcId for node ${nodeId}`);
              }
              // Clear jump target if changing type away from 'jump'
              if (newType !== 'jump' && oldType === 'jump') {
                  delete node.data.targetNpcId;
                  delete node.data.targetConversationId;
                  console.log(`[Store] Cleared jump target for node ${nodeId}`);
              }
              console.log(`[Store] Updated type for node ${nodeId} to "${newType}"`);
            } else {
                console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update type.`);
            }
        });
        triggerSave();
      },

      updateNodeNpcId: (nodeId, npcId) => {
        if (!nodeId) return;
        set(draft => {
            const conv = getCurrentConversation(draft);
            const node = conv?.nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type === 'npc' // Only update if it's an NPC node
            );
            if (node) {
              if (npcId) {
                node.data.npcId = npcId;
                 console.log(`[Store] Updated npcId for node ${nodeId} to "${npcId}"`);
              } else {
                delete node.data.npcId;
                console.log(`[Store] Cleared npcId for node ${nodeId}`);
              }
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is not an NPC node, cannot update npcId.`);
            }
        });
        triggerSave();
      },

      updateNodeTargetConversation: (nodeId, targetNpcId, targetConversationId) => {
        if (!nodeId) return;
        set(draft => {
          const conv = getCurrentConversation(draft);
          const node = conv?.nodes?.find(
            (n: DialogueNode) => n.id === nodeId && n.type === 'jump' // Only update if it's a jump node
          );
          if (node) {
            if (targetNpcId && targetConversationId) {
              node.data.targetNpcId = targetNpcId;
              node.data.targetConversationId = targetConversationId;
              console.log(`[Store] Updated jump target for node ${nodeId} to NPC: ${targetNpcId}, Conv: ${targetConversationId}`);
            } else {
              // Clear target if either ID is missing
              delete node.data.targetNpcId;
              delete node.data.targetConversationId;
              console.log(`[Store] Cleared jump target for node ${nodeId}`);
            }
          } else {
            console.warn(`[Store] Node ${nodeId} not found or is not a jump node, cannot update target conversation.`);
          }
        });
        triggerSave();
      },

      jumpToConversation: (targetNpcId, targetConversationId) => {
        if (!targetNpcId || !targetConversationId) {
           console.warn('[Store] jumpToConversation called with missing IDs.');
           return;
        }
        console.log(`[Store] Jumping to NPC: ${targetNpcId}, Conversation: ${targetConversationId}`);
        const targetNpcExists = get().npcs.some(npc => npc.id === targetNpcId);
        const targetConvExists = get().npcs.find(npc => npc.id === targetNpcId)?.conversations.some(conv => conv.id === targetConversationId);

        if (targetNpcExists && targetConvExists) {
          set(draft => {
            draft.selectedNpcId = targetNpcId;
            draft.selectedConversationId = targetConversationId;
          });
          // Don't trigger save, this is navigation
        } else {
          console.error(`[Store] Jump target not found! NPC: ${targetNpcId}, Conv: ${targetConversationId}`);
          set(draft => {
              draft.dbError = `Jump target dialogue (NPC: ${targetNpcId}, Conv: ${targetConversationId}) not found. It might have been deleted.`;
          });
          // Clear error after a delay
          setTimeout(() => set(draft => { draft.dbError = null; }), 5000);
        }
      },
    };
  })
);

// --- Custom Hooks for Selecting State Slices ---

export const useNodeInfoPanelData = () => useDialogueStore((state) => ({
    selectedNode: state.getSelectedNodeInfo(),
    onNodesChange: state.onNodesChange,
    updateNodeData: state.updateNodeData,
    updateNodeText: state.updateNodeText,
    updateNodeType: state.updateNodeType,
    updateNodeNpcId: state.updateNodeNpcId,
    updateNodeTargetConversation: state.updateNodeTargetConversation, // Expose new action
    availableNodeTypes: state.getNodeTypes(),
    npcOptions: state.getNpcListForDropdown(),
    allConversationsForDropdown: state.getAllConversationsForDropdown(), // Expose new selector
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
    updateNpcAccentColor: state.updateNpcAccentColor,
    updateNpcLayoutDirection: state.updateNpcLayoutDirection,
    selectedNpc: state.selectedNpc(),
    reorderNpcs: state.reorderNpcs,
    reorderConversations: state.reorderConversations,
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


// Helper function to create new nodes (called from DialogueFlow onConnectEnd)
export const createDialogueNode = (
    type: 'user' | 'npc' | 'custom' | 'input' | 'jump', // Added 'jump' type
    labelPrefix: string,
    position: XYPosition,
    isHorizontal: boolean,
    selectedNpcId: string | null
): DialogueNode => {
    const newNodeId = getNextNodeId();
    const newNode: DialogueNode = {
        id: newNodeId,
        type: type,
        position: position,
        data: {
            label: `${labelPrefix} ${newNodeId}`,
            text: '',
            // Set npcId only if creating an NPC node and an NPC is selected
            ...(type === 'npc' && selectedNpcId ? { npcId: selectedNpcId } : {}),
            // Jump nodes created via drag-connect start without a target
        },
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
    return newNode;
};