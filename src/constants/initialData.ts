// src/constants/initialData.ts
import { Position } from 'reactflow';
import { NodeDimensions, LayoutConstants, DialogueNode, DialogueEdge, NPC, Conversation } from '../types';

// --- Node dimensions and layout constants remain the same ---
export const NODE_DIMENSIONS: NodeDimensions = {
  WIDTH: 150,
  HEIGHT: 60,
};

export const LAYOUT_CONSTANTS: LayoutConstants = {
  HORIZONTAL_NODE_DISTANCE: 250,
  VERTICAL_NODE_DISTANCE: 150,
  HORIZONTAL_LEVEL_DISTANCE: 300,
  VERTICAL_LEVEL_DISTANCE: 150,
  INITIAL_X_OFFSET: 50,
  INITIAL_Y_OFFSET: 50,
};

// --- Helper for unique IDs (replace with UUID in a real app) ---
let npcIdCounter = 1;
let convIdCounter = 1;
let nodeIdCounter = 10; // Keep node IDs separate

export const generateNpcId = (): string => `npc-${npcIdCounter++}`;
export const generateConversationId = (): string => `conv-${convIdCounter++}`;
export const getNextNodeId = (): string => `${nodeIdCounter++}`; // Reuse existing node ID generator

// --- Function to create initial nodes/edges for a new conversation ---
export const createInitialConversationData = (conversationName = "New Conversation"): Pick<Conversation, 'nodes' | 'edges'> => {
  const startNodeId = getNextNodeId();
  return {
    nodes: [
      {
        id: startNodeId,
        type: 'input', // Start node is often 'input' type in React Flow
        data: {
          label: `Start: ${conversationName}`,
          className: 'node-start',
        },
        position: { x: 250, y: 50 },
        sourcePosition: Position.Right, // Default to horizontal
        targetPosition: Position.Left,  // Default to horizontal
      },
    ],
    edges: [],
  };
};


// --- Original Initial Nodes/Edges (for the first conversation) ---
// Modified to keep only the start module
const initialConv1Nodes: DialogueNode[] = [
  {
    id: '1', 
    type: 'input',
    data: { label: 'Start Conversation'},
    position: { x: 250, y: 0 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  }
];

// --- Edges remain the same ---
// Modified to remove all edges since we only have the start node
const initialConv1Edges: DialogueEdge[] = [];


// --- New Initial Data Structure ---
export const initialNpcs: NPC[] = [
  {
    id: generateNpcId(),
    name: 'Guard Captain',
    conversations: [
      {
        id: generateConversationId(),
        name: 'Greeting',
        nodes: initialConv1Nodes,
        edges: initialConv1Edges,
      },
      {
        id: generateConversationId(),
        name: 'Quest Intro',
        ...createInitialConversationData('Quest Intro'),
      },
    ],
  },
  {
    id: generateNpcId(),
    name: 'Mysterious Merchant',
    conversations: [
       {
        id: generateConversationId(),
        name: 'Trade Offer',
        ...createInitialConversationData('Trade Offer'),
      },
    ],
  },
];

// Default empty state if needed
export const DEFAULT_EMPTY_NODES: DialogueNode[] = [];
export const DEFAULT_EMPTY_EDGES: DialogueEdge[] = [];