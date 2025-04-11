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
  Node, // Import Node type from React Flow
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

// Define the shape of the Zustand store state
interface DialogueState {
  npcs: NPC[];
  selectedNpcId: string | null;
  selectedConversationId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  dbError: string | null;

  // Derived state selectors (functions that compute state based on other state)
  selectedNpc: () => NPC | undefined;
  selectedConversation: () => Conversation | undefined;
  activeNodes: () => DialogueNode[];
  activeEdges: () => DialogueEdge[];
  selectedNodes: () => DialogueNode[]; // Selector for currently selected nodes
  getSelectedNodeInfo: () => DialogueNode | null; // Selector for single selected node details

  // Actions (functions that modify the state)
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
  updateNodeData: (nodeId: string, newLabel: string) => void; // Action to update node data (e.g., label)
}

// Variable to hold the debounced save function instance
let debouncedSave: ReturnType<typeof debounce<() => Promise<void>>> | null = null;

/**
 * Performs the actual saving of NPC data to IndexedDB.
 * Separated to be callable directly or via debounce.
 * @param stateToSave - The relevant parts of the state needed for saving.
 * @param set - The Zustand set function (non-Immer version for async updates).
 */
const performSave = async (stateToSave: Pick<DialogueState, 'npcs' | 'isLoading'>, set: (partial: Partial<DialogueState>) => void) => {
    // Don't save if initial data is still loading
    if (stateToSave.isLoading) return;
    console.log('[Store] Performing save...');
    set({ isSaving: true }); // Set saving state
    try {
        // Call the service function to save all NPCs
        await saveAllNpcs(stateToSave.npcs);
        // Update state on successful save
        set({ lastSaved: new Date(), isSaving: false, dbError: null });
        console.log('[Store] Save successful.');
    } catch (error: any) {
        // Update state on save error
        console.error('[Store] Auto-save failed:', error);
        set({ isSaving: false, dbError: `Save failed: ${error?.message || error}` });
    }
};

/**
 * Initializes the debounced save function if it doesn't exist.
 * @param get - The Zustand get function to access current state.
 * @param set - The Zustand set function (non-Immer version).
 * @returns The debounced save function.
 */
const initializeDebouncedSave = (get: () => DialogueState, set: (partial: Partial<DialogueState>) => void) => {
    if (!debouncedSave) {
        debouncedSave = debounce(async () => {
            // Get the current state needed for saving when the debounce triggers
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, set);
        }, 1500); // Debounce interval (e.g., 1.5 seconds)
    }
    return debouncedSave;
};

// Create the Zustand store, wrapping the state creator with Immer middleware for easier state updates
export const useDialogueStore = create(
  immer<DialogueState>((set, get) => {

    // Initialize the debounced save function, passing a non-Immer setter
    const debouncedSaveFn = initializeDebouncedSave(get, (partial) => set(state => ({...state, ...partial})) );

    /**
     * Triggers a save operation, either immediately or debounced.
     * @param immediate - If true, saves immediately, cancelling any pending debounced save.
     */
    const triggerSave = async (immediate = false) => {
        if (immediate) {
            console.log('[Store] Immediate save triggered.');
            debouncedSaveFn.cancel(); // Cancel pending debounce
            // Get current state and save immediately
            const state = get();
            await performSave({ npcs: state.npcs, isLoading: state.isLoading }, (partial) => set(state => ({...state, ...partial})) );
        } else {
            // Call the debounced function, which will execute after the interval
            debouncedSaveFn();
        }
    };

    /**
     * Helper function to find the array indices of the currently selected NPC and Conversation.
     * Useful within Immer actions to locate the correct data to modify.
     * @param state - The current draft state (inside Immer).
     * @returns Object containing npcIndex and convIndex (-1 if not found).
     */
    const findIndices = (state: DialogueState) => {
        const npcIndex = state.npcs.findIndex(npc => npc.id === state.selectedNpcId);
        if (npcIndex === -1) return { npcIndex: -1, convIndex: -1 };
        // Use optional chaining and nullish coalescing for safety
        const convIndex = state.npcs[npcIndex]?.conversations.findIndex(conv => conv.id === state.selectedConversationId) ?? -1;
        return { npcIndex, convIndex };
    };

    // Return the initial state and actions
    return {
      // --- Initial State ---
      npcs: [],
      selectedNpcId: null,
      selectedConversationId: null,
      isLoading: true, // Start in loading state
      isSaving: false,
      lastSaved: null,
      dbError: null,

      // --- Derived State Selectors ---
      selectedNpc: () => get().npcs.find((npc) => npc.id === get().selectedNpcId),
      selectedConversation: () => get().selectedNpc()?.conversations.find((conv) => conv.id === get().selectedConversationId),
      activeNodes: () => get().selectedConversation()?.nodes || DEFAULT_EMPTY_NODES,
      activeEdges: () => get().selectedConversation()?.edges || DEFAULT_EMPTY_EDGES,
      selectedNodes: () => get().activeNodes().filter(node => node.selected), // Filter active nodes by their 'selected' prop
      getSelectedNodeInfo: () => {
        const selected = get().selectedNodes();
        // Return the node object only if exactly one node is selected
        return selected.length === 1 ? selected[0] : null;
      },

      // --- Actions (implemented using Immer drafts where applicable) ---
      loadInitialData: async () => {
        // Set loading state directly (non-nested state)
        set({ isLoading: true, dbError: null });
        try {
          console.log("[Store] Loading initial data...");
          const loadedNpcs = await loadAllNpcs(); // Load from IndexedDB
          console.log(`[Store] Loaded ${loadedNpcs.length} NPCs.`);

          // Synchronize the ID manager with the loaded data to avoid ID collisions
          try {
              console.log("[Store] Syncing IdManager with loaded data...");
              IdManager.syncWithData(loadedNpcs);
              console.log("[Store] IdManager synced.");
          } catch (syncError: any) {
              console.error("[Store] Error syncing IdManager:", syncError);
              // Update error state within the Immer draft
              set(draft => {
                  draft.dbError = `Failed to sync ID Manager: ${syncError?.message || syncError}`;
              });
          }

          // Determine the initial selection after loading
          let initialNpcId: string | null = null;
          let initialConvId: string | null = null;
          if (loadedNpcs.length > 0) {
            initialNpcId = loadedNpcs[0].id;
            if (loadedNpcs[0].conversations.length > 0) {
              initialConvId = loadedNpcs[0].conversations[0].id;
            }
          }

          // Update the main state using Immer
          set(draft => {
            draft.npcs = loadedNpcs;
            draft.selectedNpcId = initialNpcId;
            draft.selectedConversationId = initialConvId;
            draft.isLoading = false; // Loading finished
            draft.lastSaved = new Date(); // Consider data loaded as 'saved' initially
            draft.dbError = draft.dbError || null; // Preserve potential sync error
          });
          console.log("[Store] Initial data loaded and state set.");

        } catch (error: any) {
          console.error('[Store] Error loading data:', error);
          // Attempt to sync ID manager even on fallback
          try {
            IdManager.syncWithData(initialNpcs);
          } catch (syncError: any) {
             console.error("[Store] Error syncing IdManager with fallback:", syncError);
          }
          // Fallback to initial empty data on error
          set(draft => {
            draft.npcs = initialNpcs;
            draft.selectedNpcId = null;
            draft.selectedConversationId = null;
            draft.isLoading = false;
            draft.dbError = `Failed to load data: ${error?.message || error}`;
          });
        }
      },

      // Assign the local triggerSave function to the state action
      triggerSave: triggerSave,

      addNpc: (name) => {
        const newNpcId = IdManager.generateNpcId();
        const newConversationId = IdManager.generateConversationId();
        const conversationName = 'Default Conversation'; // Default name for first convo
        // Create the new NPC object
        const newNpc: NPC = {
          id: newNpcId,
          name: name?.trim() || `New NPC ${newNpcId.split('-')[1]}`, // Use provided name or generate one
          image: undefined, // Start with no image
          conversations: [
            {
              id: newConversationId,
              name: conversationName,
              ...createInitialConversationData(conversationName), // Create initial nodes/edges
            },
          ],
        };
        // Update state using Immer draft
        set(draft => {
          draft.npcs.push(newNpc);
          // Automatically select the newly created NPC and its conversation
          draft.selectedNpcId = newNpcId;
          draft.selectedConversationId = newConversationId;
        });
        triggerSave(); // Trigger save after adding
      },

      selectNpc: (npcId) => {
        // Only update state if the selected NPC is actually changing
        if (npcId !== get().selectedNpcId) {
          const npc = get().npcs.find(n => n.id === npcId);
          if (npc) {
            set(draft => {
              draft.selectedNpcId = npcId;
              // Select the first conversation of the newly selected NPC
              draft.selectedConversationId = npc.conversations[0]?.id || null;
            });
          }
        }
        // No save needed for just changing selection
      },

      deleteNpc: (npcId) => {
        if (!npcId) return;
        const currentSelectedNpcId = get().selectedNpcId;
        const currentSelectedConvId = get().selectedConversationId;
        let nextSelectedNpcId: string | null = null;
        let nextSelectedConvId: string | null = null;

        set(draft => {
            // Find the index of the NPC to delete
            const npcIndex = draft.npcs.findIndex((npc) => npc.id === npcId);
            if (npcIndex === -1) return; // NPC not found

            // Remove the NPC using splice
            const deletedNpc = draft.npcs.splice(npcIndex, 1)[0];

            // Determine the next selected NPC and conversation
            if (deletedNpc.id === currentSelectedNpcId) {
                // If the deleted NPC was the selected one, select the first remaining NPC (if any)
                nextSelectedNpcId = draft.npcs[0]?.id || null;
                nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
            } else {
                // If a different NPC was deleted, try to keep the current selection
                nextSelectedNpcId = currentSelectedNpcId;
                nextSelectedConvId = currentSelectedConvId;
                 // Verify the kept selection is still valid
                 const currentNpcStillExists = draft.npcs.find(n => n.id === nextSelectedNpcId);
                 if (!currentNpcStillExists) {
                     // If the previously selected NPC somehow disappeared, select the first overall
                     nextSelectedNpcId = draft.npcs[0]?.id || null;
                     nextSelectedConvId = draft.npcs[0]?.conversations[0]?.id || null;
                 } else if (!currentNpcStillExists.conversations.some(c => c.id === nextSelectedConvId)) {
                     // If the selected conversation is gone (shouldn't happen here), select first of current NPC
                     nextSelectedConvId = currentNpcStillExists.conversations[0]?.id || null;
                 }
            }
            // Update the selection state
            draft.selectedNpcId = nextSelectedNpcId;
            draft.selectedConversationId = nextSelectedConvId;
        });
        triggerSave(); // Trigger save after deletion
      },

      updateNpcName: (npcId, newName) => {
        if (!npcId || !newName.trim()) return; // Basic validation
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) {
                npc.name = newName.trim(); // Update the name
            }
        });
        triggerSave(); // Trigger save after update
      },

      updateNpcImage: (npcId, imageDataUrl) => {
        if (!npcId) return;
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) {
                // Allow setting image to undefined (to remove it)
                npc.image = imageDataUrl;
            }
        });
        triggerSave(); // Trigger save after update
      },

      addConversation: (npcId, name) => {
        if (!npcId) return;
        const newConversationId = IdManager.generateConversationId();
        // Use provided name or generate a default one
        const newName = name?.trim() || `New Conversation ${newConversationId.split('-')[1]}`;
        // Create the new conversation object
        const newConversation: Conversation = {
          id: newConversationId,
          name: newName,
          ...createInitialConversationData(newName), // Add initial nodes/edges
        };
        set(draft => {
            const npc = draft.npcs.find((n: NPC) => n.id === npcId);
            if (npc) {
                npc.conversations.push(newConversation);
                // Automatically select the newly created conversation
                draft.selectedConversationId = newConversationId;
            }
        });
        triggerSave(); // Trigger save after adding
      },

      selectConversation: (conversationId) => {
         // Only update state if the selected conversation is actually changing
         if (conversationId !== get().selectedConversationId) {
             const npc = get().selectedNpc();
             // Check if the conversation exists within the currently selected NPC
             if (npc && npc.conversations.some(c => c.id === conversationId)) {
                 set(draft => { draft.selectedConversationId = conversationId });
             } else {
                 // Log a warning if trying to select a non-existent/unloaded conversation
                 console.warn(`Attempted to select conversation ${conversationId} which does not exist or isn't loaded on NPC ${get().selectedNpcId}`);
             }
         }
         // No save needed for just changing selection
      },

      deleteConversation: (conversationId) => {
        const npcId = get().selectedNpcId;
        if (!conversationId || !npcId) return;

        set(draft => {
            // Find the index of the currently selected NPC
            const npcIndex = draft.npcs.findIndex(n => n.id === npcId);
            if (npcIndex === -1) return; // NPC not found

            const npc = draft.npcs[npcIndex];
            // Prevent deleting the last conversation of an NPC
            if (npc.conversations.length <= 1) {
                console.warn("Cannot delete the last conversation for an NPC.");
                return;
            }

            // Find the index of the conversation to delete
            const convIndex = npc.conversations.findIndex((c: Conversation) => c.id === conversationId);
            if (convIndex !== -1) {
                const deletedConvId = npc.conversations[convIndex].id;
                // Remove the conversation using splice
                npc.conversations.splice(convIndex, 1);

                // If the deleted conversation was the selected one, select the first remaining one
                if (deletedConvId === draft.selectedConversationId) {
                    draft.selectedConversationId = npc.conversations[0]?.id || null;
                }
            }
        });
        triggerSave(); // Trigger save after deletion
      },

      updateConversationName: (conversationId, newName) => {
        const npcId = get().selectedNpcId;
        if (!conversationId || !newName.trim() || !npcId) return; // Basic validation
        const finalName = newName.trim();

        set(draft => {
            // Find indices using the draft state
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                conv.name = finalName; // Update conversation name

                // Also update the label of the start node ('input' type) for consistency
                const startNode = conv.nodes?.find((node: DialogueNode) => node.type === 'input');
                if (startNode) {
                    startNode.data.label = `Start: ${finalName}`;
                }
            }
        });
        triggerSave(); // Trigger save after update
      },

      // React Flow's node change handler (handles drag, selection, dimension changes)
      onNodesChange: (changes) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                if (!conv.nodes) conv.nodes = []; // Ensure nodes array exists
                // Apply the changes provided by React Flow using its utility function
                // This updates positions, dimensions, and crucially, the 'selected' status
                conv.nodes = applyNodeChanges(changes, conv.nodes);
            }
        });
        // Trigger debounced save (React Flow can fire many changes during drag)
        triggerSave();
      },

      // React Flow's edge change handler (handles selection, removal)
      onEdgesChange: (changes) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex !== -1 && convIndex !== -1) {
                const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.edges) conv.edges = []; // Ensure edges array exists
                // Apply edge changes using React Flow's utility function
                conv.edges = applyEdgeChanges(changes, conv.edges);
            }
        });
        triggerSave(); // Trigger debounced save
      },

      // React Flow's connection handler (when an edge is successfully created)
      onConnect: (connection) => {
        set(draft => {
            const { npcIndex, convIndex } = findIndices(draft);
            if (npcIndex === -1 || convIndex === -1) return; // Ensure context is valid
            // Prevent nodes connecting to themselves
            if (connection.source === connection.target) return;

            const conv = draft.npcs[npcIndex].conversations[convIndex];
             if (!conv.edges) conv.edges = []; // Ensure edges array exists

            // Ensure connection has required fields and generate a unique ID
            if (connection.source && connection.target) {
                const uniqueConnection = {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}` // Simple unique ID strategy
                };
                // Add the new edge using React Flow's utility function
                conv.edges = addEdge(uniqueConnection, conv.edges);
            } else {
                console.warn("Attempted to add edge with missing source or target:", connection);
            }
        });
        triggerSave(); // Trigger save after adding edge
      },

      // Action to manually set the entire nodes array
      setNodes: (nodesOrUpdater) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                  if (!conv.nodes) conv.nodes = []; // Ensure nodes array exists before update
                 // Allow passing either a new array or an updater function
                 conv.nodes = typeof nodesOrUpdater === 'function'
                   ? nodesOrUpdater(conv.nodes)
                   : nodesOrUpdater;
             }
         });
         triggerSave(); // Trigger save after manual set
      },

      // Action to manually set the entire edges array
      setEdges: (edgesOrUpdater) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.edges) conv.edges = []; // Ensure edges array exists before update
                 // Allow passing either a new array or an updater function
                 conv.edges = typeof edgesOrUpdater === 'function'
                   ? edgesOrUpdater(conv.edges)
                   : edgesOrUpdater;
             }
         });
         triggerSave(); // Trigger save after manual set
      },

      // Action to update positions of multiple nodes (e.g., after auto-layout)
      updateNodePositions: (positions) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.nodes) return; // No nodes to update positions for
                 // Iterate through nodes and update position if found in the provided map
                 conv.nodes.forEach((node: Node) => { // Use React Flow's Node type for position property
                     if (positions[node.id]) {
                         node.position = positions[node.id];
                     }
                 });
             }
         });
         triggerSave(); // Trigger save after position updates
      },

      // Action to update the layout direction (source/target handles) for all nodes
      updateNodeLayout: (isHorizontal) => {
         set(draft => {
             const { npcIndex, convIndex } = findIndices(draft);
             if (npcIndex !== -1 && convIndex !== -1) {
                 const conv = draft.npcs[npcIndex].conversations[convIndex];
                 if (!conv.nodes) return; // No nodes to update
                 // Update source/target positions based on the direction
                 conv.nodes.forEach((node: DialogueNode) => {
                     node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
                     node.targetPosition = isHorizontal ? Position.Left : Position.Top;
                 });
             }
         });
         triggerSave(); // Trigger save after layout change
      },

      // Action to update data within a specific node (e.g., label)
      updateNodeData: (nodeId, newLabel) => {
        if (!nodeId || !newLabel.trim()) return; // Basic validation
        set(draft => {
          const { npcIndex, convIndex } = findIndices(draft);
          if (npcIndex !== -1 && convIndex !== -1) {
            // Find the specific node, ensuring it's not the 'input' (start) node
            const node = draft.npcs[npcIndex].conversations[convIndex].nodes?.find(
              (n: DialogueNode) => n.id === nodeId && n.type !== 'input'
            );
            if (node) {
              // Update the data object immutably (spread existing data, then update label)
              node.data = { ...node.data, label: newLabel.trim() };
              console.log(`[Store] Updated label for node ${nodeId} to "${node.data.label}"`);
            } else {
                 console.warn(`[Store] Node ${nodeId} not found or is start node, cannot update label.`);
            }
          }
        });
        triggerSave(); // Trigger auto-save after update
      },
    };
  }) // End of immer middleware wrapper
); // End of create

// --- Custom Hooks for Selecting State Slices ---

/**
 * Hook providing state and actions needed for the NodeInfoPanel component.
 */
export const useNodeInfoPanelData = () => useDialogueStore((state) => ({
    selectedNode: state.getSelectedNodeInfo(), // Get the single selected node info (or null)
    updateNodeData: state.updateNodeData,     // Get the action to update node data
}));

/**
 * Hook providing state and actions needed for the CardSidebar component.
 */
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
    selectedNpc: state.selectedNpc(), // Call derived state function to get the object
}));

/**
 * Hook providing state and actions needed for the DialogueFlow component.
 */
export const useFlowData = () => useDialogueStore((state) => ({
    nodes: state.activeNodes(), // Get nodes for the current conversation
    edges: state.activeEdges(), // Get edges for the current conversation
    onNodesChange: state.onNodesChange, // React Flow's node change handler
    onEdgesChange: state.onEdgesChange, // React Flow's edge change handler
    onConnect: state.onConnect,         // React Flow's connection handler
    setNodes: state.setNodes,           // Action to manually replace nodes
    setEdges: state.setEdges,           // Action to manually replace edges
}));

/**
 * Hook providing state related to loading, saving, and database errors.
 */
export const useSavingStatus = () => useDialogueStore((state) => ({
    isSaving: state.isSaving,           // Is a save operation currently in progress?
    lastSaved: state.lastSaved,         // Timestamp of the last successful save
    isLoading: state.isLoading,         // Is the initial data load in progress?
    triggerSave: state.triggerSave,     // Function to manually trigger a save
    dbError: state.dbError,             // Any database-related error message
}));