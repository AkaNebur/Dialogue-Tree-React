// src/constants/initialData.js
import { Position } from 'reactflow';

// --- Node dimensions and layout constants remain the same ---
export const NODE_DIMENSIONS = {
  WIDTH: 150,
  HEIGHT: 60,
};

export const LAYOUT_CONSTANTS = {
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

export const generateNpcId = () => `npc-${npcIdCounter++}`;
export const generateConversationId = () => `conv-${convIdCounter++}`;
export const getNextNodeId = () => `${nodeIdCounter++}`; // Reuse existing node ID generator

// --- Function to create initial nodes/edges for a new conversation ---
export const createInitialConversationData = (conversationName = "New Conversation") => {
  const startNodeId = getNextNodeId();
  return {
    nodes: [
      {
        id: startNodeId,
        type: 'input', // Start node is often 'input' type in React Flow
        data: {
          label: `Start: ${conversationName}`,
          className: 'node-start', // <-- Moved inside data
        },
        position: { x: 250, y: 50 },
        // className: 'node-start', // Removed from top level
        sourcePosition: Position.Right, // Default to horizontal
        targetPosition: Position.Left,  // Default to horizontal
      },
    ],
    edges: [],
  };
};


// --- Original Initial Nodes/Edges (for the first conversation) ---
// IMPORTANT: Update these nodes as well
const initialConv1Nodes = [
  {
    id: '1', type: 'input',
    data: { label: 'Start Conversation', className: 'node-start' }, // <-- Moved inside data
    position: { x: 250, y: 0 },
    // className: 'node-start', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
  {
    id: '2',
    data: { label: 'Hello, how are you?', className: 'node-hello' }, // <-- Moved inside data
    position: { x: 100, y: 100 },
    // className: 'node-hello', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
  {
    id: '3',
    data: { label: 'Know about products?', className: 'node-products' }, // <-- Moved inside data
    position: { x: 400, y: 100 },
    // className: 'node-products', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
  {
    id: '4',
    data: { label: 'I\'m feeling great!', className: 'node-great' }, // <-- Moved inside data
    position: { x: 100, y: 200 },
    // className: 'node-great', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
  {
    id: '5',
    data: { label: 'Yes, tell me more', className: 'node-more' }, // <-- Moved inside data
    position: { x: 300, y: 200 },
    // className: 'node-more', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
  {
    id: '6',
    data: { label: 'No, maybe later', className: 'node-later' }, // <-- Moved inside data
    position: { x: 500, y: 200 },
    // className: 'node-later', // Removed
    sourcePosition: Position.Right, targetPosition: Position.Left,
  },
];

// --- Edges remain the same ---
const initialConv1Edges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' },
  { id: 'e3-6', source: '3', target: '6' },
];


// --- New Initial Data Structure (No changes needed here as it uses the updated functions/arrays) ---
export const initialNpcs = [
  {
    id: generateNpcId(),
    name: 'Guard Captain',
    conversations: [
      {
        id: generateConversationId(),
        name: 'Greeting',
        nodes: initialConv1Nodes, // Uses updated nodes
        edges: initialConv1Edges,
      },
      {
        id: generateConversationId(),
        name: 'Quest Intro',
        ...createInitialConversationData('Quest Intro'), // Uses updated helper
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
        ...createInitialConversationData('Trade Offer'), // Uses updated helper
      },
    ],
  },
];

// Default empty state if needed
export const DEFAULT_EMPTY_NODES = [];
export const DEFAULT_EMPTY_EDGES = [];