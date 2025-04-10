// src/hooks/useDialogueManager.ts - UPDATE with image handling functionality
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  Connection,
  NodeChange,
  EdgeChange
} from 'reactflow';
import {
  initialNpcs,
  generateNpcId,
  generateConversationId,
  createInitialConversationData,
  DEFAULT_EMPTY_NODES,
  DEFAULT_EMPTY_EDGES,
} from '../constants/initialData';
import { 
  DialogueNode, 
  DialogueEdge, 
  NPC, 
  Conversation,
  NodePositions,
  UseDialogueManagerReturn
} from '../types';
import { loadAllNpcs } from '../services/dialogueService';
import useAutoSave from './useAutoSave';

type ConversationUpdater = (conv: Conversation) => Conversation;

/**
 * Custom hook to manage NPCs, their conversations, and the active dialogue flow state.
 * Now with name editing and image management functionality.
 */
const useDialogueManager = (): UseDialogueManagerReturn & { 
  isSaving: boolean; 
  lastSaved: Date | null;
  isLoading: boolean;
  updateNpcName: (npcId: string, newName: string) => void;
  updateConversationName: (conversationId: string, newName: string) => void;
  updateNpcImage: (npcId: string, imageDataUrl: string | undefined) => void;
} => {
  // State initialization with loading status
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Initialize auto-save hook
  const { isSaving, lastSaved, saveData, saveImmediately } = useAutoSave(1500); // 1.5 second debounce

  // --- Data Loading ---
  
  // Load data from IndexedDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load NPCs from IndexedDB (or fallback to initial data)
        const loadedNpcs = await loadAllNpcs();
        setNpcs(loadedNpcs);
        
        // Select the first NPC and conversation if available
        if (loadedNpcs.length > 0) {
          setSelectedNpcId(loadedNpcs[0].id);
          if (loadedNpcs[0].conversations.length > 0) {
            setSelectedConversationId(loadedNpcs[0].conversations[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to initial data if loading fails
        setNpcs(initialNpcs);
        if (initialNpcs.length > 0) {
          setSelectedNpcId(initialNpcs[0].id);
          if (initialNpcs[0].conversations.length > 0) {
            setSelectedConversationId(initialNpcs[0].conversations[0].id);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // --- Auto-Save Effect ---
  
  // Trigger auto-save whenever NPCs data changes
  useEffect(() => {
    if (!isLoading && npcs.length > 0) {
      saveData(npcs);
    }
  }, [npcs, isLoading, saveData]);

  // --- Data Retrieval ---

  const selectedNpc = useMemo(
    () => npcs.find((npc) => npc.id === selectedNpcId),
    [npcs, selectedNpcId]
  );

  const selectedConversation = useMemo(
    () => selectedNpc?.conversations.find((conv) => conv.id === selectedConversationId),
    [selectedNpc, selectedConversationId]
  );

  // Active nodes and edges for the React Flow component
  const activeNodes = useMemo(
    () => selectedConversation?.nodes || DEFAULT_EMPTY_NODES,
    [selectedConversation]
  );
  const activeEdges = useMemo(
    () => selectedConversation?.edges || DEFAULT_EMPTY_EDGES,
    [selectedConversation]
  );

  // --- State Update Callbacks ---

  const updateConversationData = useCallback((
    npcId: string, 
    conversationId: string, 
    dataUpdater: ConversationUpdater
  ) => {
    setNpcs((currentNpcs) =>
      currentNpcs.map((npc) => {
        if (npc.id === npcId) {
          return {
            ...npc,
            conversations: npc.conversations.map((conv) => {
              if (conv.id === conversationId) {
                // dataUpdater receives the current conversation and returns the updated one
                return dataUpdater(conv);
              }
              return conv;
            }),
          };
        }
        return npc;
      })
    );
  }, []);


  // --- NPC Management ---

  const addNpc = useCallback((name: string) => {
    const newNpcId = generateNpcId();
    const newConversationId = generateConversationId();
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
    setNpcs((prev) => [...prev, newNpc]);
    // Select the new NPC and its default conversation
    setSelectedNpcId(newNpcId);
    setSelectedConversationId(newConversationId);
  }, []);

  const selectNpc = useCallback((npcId: string) => {
    const npc = npcs.find(n => n.id === npcId);
    if (npc) {
        setSelectedNpcId(npcId);
        // Select the first conversation of the newly selected NPC
        setSelectedConversationId(npc.conversations[0]?.id || null);
    }
  }, [npcs]); // Depend on npcs to find the npc correctly

  // --- NPC Name Update Function ---
  const updateNpcName = useCallback((npcId: string, newName: string) => {
    if (!npcId || !newName.trim()) return;
    
    setNpcs((currentNpcs) =>
      currentNpcs.map((npc) => {
        if (npc.id === npcId) {
          return {
            ...npc,
            name: newName.trim()
          };
        }
        return npc;
      })
    );
  }, []);
  
  // --- NEW: NPC Image Update Function ---
  const updateNpcImage = useCallback((npcId: string, imageDataUrl: string | undefined) => {
    if (!npcId) return;
    
    setNpcs((currentNpcs) =>
      currentNpcs.map((npc) => {
        if (npc.id === npcId) {
          return {
            ...npc,
            image: imageDataUrl
          };
        }
        return npc;
      })
    );
  }, []);

  // --- Conversation Management ---

  const addConversation = useCallback((npcId: string, name: string) => {
      if (!npcId) return;
      const newConversationId = generateConversationId();
      const newConversation: Conversation = {
          id: newConversationId,
          name: name || `New Conversation ${newConversationId.split('-')[1]}`,
          ...createInitialConversationData(name),
      };

      setNpcs((prevNpcs) =>
          prevNpcs.map((npc) => {
              if (npc.id === npcId) {
                  return {
                      ...npc,
                      conversations: [...npc.conversations, newConversation],
                  };
              }
              return npc;
          })
      );
      // Select the newly added conversation
      setSelectedConversationId(newConversationId);

  }, []); // No dependencies needed here as it uses npcId passed in

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  // --- Conversation Name Update Function ---
  const updateConversationName = useCallback((conversationId: string, newName: string) => {
    if (!conversationId || !newName.trim() || !selectedNpcId) return;
    
    setNpcs((currentNpcs) =>
      currentNpcs.map((npc) => {
        if (npc.id === selectedNpcId) {
          return {
            ...npc,
            conversations: npc.conversations.map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  name: newName.trim(),
                  // Also update the start node label if it exists and contains the old name
                  nodes: conv.nodes.map(node => {
                    if (node.type === 'input' && node.data.label.includes(conv.name)) {
                      return {
                        ...node,
                        data: {
                          ...node.data,
                          label: `Start: ${newName.trim()}`
                        }
                      };
                    }
                    return node;
                  })
                };
              }
              return conv;
            }),
          };
        }
        return npc;
      })
    );
  }, [selectedNpcId]);

  // --- Active Dialogue Flow Handlers (for the selected conversation) ---

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        nodes: applyNodeChanges(changes, conv.nodes || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        edges: applyEdgeChanges(changes, conv.edges || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      // Prevent connecting a node to itself
      if (connection.source === connection.target) {
        console.warn('Cannot connect a node to itself');
        return;
      }
      
      if (!selectedNpcId || !selectedConversationId) return;
      
      // Add a timestamp to ensure the edge ID is unique
      const uniqueConnection = {
        ...connection,
        id: `e${connection.source}-${connection.target}-${Date.now()}`
      };
      
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        edges: addEdge(uniqueConnection, conv.edges || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  // Function to specifically set the nodes (e.g., after adding a node)
  const setNodes = useCallback(
    (nodesOrUpdater: DialogueNode[] | ((nodes: DialogueNode[]) => DialogueNode[])) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => {
        const newNodes = typeof nodesOrUpdater === 'function'
          ? nodesOrUpdater(conv.nodes || [])
          : nodesOrUpdater;
        return { ...conv, nodes: newNodes };
      });
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  // Function to specifically set the edges (e.g., after adding a node + edge)
   const setEdges = useCallback(
    (edgesOrUpdater: DialogueEdge[] | ((edges: DialogueEdge[]) => DialogueEdge[])) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => {
         const newEdges = typeof edgesOrUpdater === 'function'
           ? edgesOrUpdater(conv.edges || [])
           : edgesOrUpdater;
         return { ...conv, edges: newEdges };
       });
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
   );

  // Updates node positions (typically from auto-layout)
  const updateNodePositions = useCallback(
    (positions: NodePositions) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        nodes: (conv.nodes || []).map((node) => {
          if (positions[node.id]) {
            return { ...node, position: positions[node.id] };
          }
          return node;
        }),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  // Updates handle positions on nodes based on layout direction
  const updateNodeLayout = useCallback(
    (isHorizontal: boolean) => {
       if (!selectedNpcId || !selectedConversationId) return;
       updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
         ...conv,
         nodes: (conv.nodes || []).map((node) => ({
           ...node,
           sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
           targetPosition: isHorizontal ? Position.Left : Position.Top,
         })),
       }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
   );

  // Force an immediate save (e.g., before window unload)
  const saveImmediatelyHandler = useCallback(() => {
    if (npcs.length > 0) {
      return saveImmediately(npcs);
    }
    return Promise.resolve();
  }, [npcs, saveImmediately]);

  return {
    npcs,
    selectedNpcId,
    selectedConversationId,
    selectedNpc,
    selectedConversation,
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
    // Added name and image editing functions
    updateNpcName,
    updateConversationName,
    updateNpcImage,
    // Added auto-save state
    isSaving,
    lastSaved,
    isLoading,
    saveImmediately: saveImmediatelyHandler,
  };
};

export default useDialogueManager;