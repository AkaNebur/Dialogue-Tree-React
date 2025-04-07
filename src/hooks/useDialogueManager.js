// src/hooks/useDialogueManager.js
import { useState, useCallback, useMemo } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
} from 'reactflow';
import {
  initialNpcs,
  generateNpcId,
  generateConversationId,
  createInitialConversationData,
  DEFAULT_EMPTY_NODES,
  DEFAULT_EMPTY_EDGES,
} from '../constants/initialData';

/**
 * Custom hook to manage NPCs, their conversations, and the active dialogue flow state.
 */
const useDialogueManager = () => {
  const [npcs, setNpcs] = useState(initialNpcs);
  const [selectedNpcId, setSelectedNpcId] = useState(initialNpcs[0]?.id || null);
  const [selectedConversationId, setSelectedConversationId] = useState(
    initialNpcs[0]?.conversations[0]?.id || null
  );

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

  const updateConversationData = useCallback((npcId, conversationId, dataUpdater) => {
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

  const addNpc = useCallback((name) => {
    const newNpcId = generateNpcId();
    const newConversationId = generateConversationId();
    const newNpc = {
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

  const selectNpc = useCallback((npcId) => {
    const npc = npcs.find(n => n.id === npcId);
    if (npc) {
        setSelectedNpcId(npcId);
        // Select the first conversation of the newly selected NPC
        setSelectedConversationId(npc.conversations[0]?.id || null);
    }
  }, [npcs]); // Depend on npcs to find the npc correctly

  // --- Conversation Management ---

  const addConversation = useCallback((npcId, name) => {
      if (!npcId) return;
      const newConversationId = generateConversationId();
      const newConversation = {
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

  const selectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId);
  }, []);

  // --- Active Dialogue Flow Handlers (for the selected conversation) ---

  const onNodesChange = useCallback(
    (changes) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        nodes: applyNodeChanges(changes, conv.nodes || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        edges: applyEdgeChanges(changes, conv.edges || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  const onConnect = useCallback(
    (connection) => {
      if (!selectedNpcId || !selectedConversationId) return;
      updateConversationData(selectedNpcId, selectedConversationId, (conv) => ({
        ...conv,
        edges: addEdge(connection, conv.edges || []),
      }));
    },
    [selectedNpcId, selectedConversationId, updateConversationData]
  );

  // Function to specifically set the nodes (e.g., after adding a node)
  const setNodes = useCallback(
    (nodesOrUpdater) => {
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
    (edgesOrUpdater) => {
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
    (positions) => {
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
    (isHorizontal) => {
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

  return {
    npcs,
    selectedNpcId,
    selectedConversationId,
    selectedNpc,          // Expose derived selected NPC object
    selectedConversation, // Expose derived selected Conversation object
    activeNodes,
    activeEdges,
    setNodes, // Pass this down for node creation in DialogueFlow
    setEdges, // Pass this down for edge creation in DialogueFlow
    addNpc,
    selectNpc,
    addConversation,
    selectConversation,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodePositions,
    updateNodeLayout,
  };
};

export default useDialogueManager;