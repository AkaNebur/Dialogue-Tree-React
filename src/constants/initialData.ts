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
const initialConv1Nodes: DialogueNode[] = [
  {
    id: '1', 
    type: 'input',
    data: { label: 'Start Conversation', className: 'node-start' },
    position: { x: 250, y: 0 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
  {
    id: '2',
    data: { label: 'Hello, how are you?', className: 'node-hello' },
    position: { x: 100, y: 100 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
  {
    id: '3',
    data: { label: 'Know about products?', className: 'node-products' },
    position: { x: 400, y: 100 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
  {
    id: '4',
    data: { label: 'I\'m feeling great!', className: 'node-great' },
    position: { x: 100, y: 200 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
  {
    id: '5',
    data: { label: 'Yes, tell me more', className: 'node-more' },
    position: { x: 300, y: 200 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
  {
    id: '6',
    data: { label: 'No, maybe later', className: 'node-later' },
    position: { x: 500, y: 200 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  },
];

// --- Edges remain the same ---
const initialConv1Edges: DialogueEdge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
];


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