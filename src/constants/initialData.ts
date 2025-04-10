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

// Define window properties for TypeScript
declare global {
  interface Window {
    getNextNodeId?: () => string;
    generateNpcId?: () => string;
    generateConversationId?: () => string;
  }
}

// --- Helper for unique IDs (these will be replaced by IdManager) ---
let npcIdCounter = 1;
let convIdCounter = 1;
let nodeIdCounter = 10;

/**
 * Generate a unique NPC ID
 * Will use the window method if defined (from IdManager)
 */
export const generateNpcId = (): string => {
  // Use the window method if available (from IdManager)
  if (typeof window !== 'undefined' && window.generateNpcId) {
    return window.generateNpcId();
  }
  
  // Fallback to local counter - ensure uniqueness with timestamp
  const id = `npc-${npcIdCounter++}-${Date.now().toString().slice(-4)}`;
  return id;
};

/**
 * Generate a unique conversation ID
 * Will use the window method if defined (from IdManager)
 */
export const generateConversationId = (): string => {
  // Use the window method if available (from IdManager)
  if (typeof window !== 'undefined' && window.generateConversationId) {
    return window.generateConversationId();
  }
  
  // Fallback to local counter - ensure uniqueness with timestamp
  const id = `conv-${convIdCounter++}-${Date.now().toString().slice(-4)}`;
  return id;
};

/**
 * Get the next unique node ID
 * Will use the window method if defined (from IdManager)
 */
export const getNextNodeId = (): string => {
  // Use the window method if available (from IdManager)
  if (typeof window !== 'undefined' && window.getNextNodeId) {
    return window.getNextNodeId();
  }
  
  // Fallback to local counter
  return nodeIdCounter.toString();
};

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
    data: { label: 'Start Conversation'},
    position: { x: 250, y: 0 },
    sourcePosition: Position.Right, 
    targetPosition: Position.Left,
  }
];

// --- Edges remain the same ---
const initialConv1Edges: DialogueEdge[] = [];

// --- New Initial Data Structure using Timestamps to Ensure Unique IDs ---
export const initialNpcs: NPC[] = [
  {
    id: typeof window !== 'undefined' && window.generateNpcId 
      ? window.generateNpcId() : `npc-1-${Date.now()}`,
    name: 'Guard Captain',
    conversations: [
      {
        id: typeof window !== 'undefined' && window.generateConversationId 
          ? window.generateConversationId() : `conv-1-${Date.now()}`,
        name: 'Greeting',
        nodes: initialConv1Nodes,
        edges: initialConv1Edges,
      },
      {
        id: typeof window !== 'undefined' && window.generateConversationId 
          ? window.generateConversationId() : `conv-2-${Date.now()}`,
        name: 'Quest Intro',
        ...createInitialConversationData('Quest Intro'),
      },
    ],
  },
  {
    id: typeof window !== 'undefined' && window.generateNpcId 
      ? window.generateNpcId() : `npc-2-${Date.now() + 1}`,
    name: 'Mysterious Merchant',
    conversations: [
       {
        id: typeof window !== 'undefined' && window.generateConversationId 
          ? window.generateConversationId() : `conv-3-${Date.now()}`,
        name: 'Trade Offer',
        ...createInitialConversationData('Trade Offer'),
      },
    ],
  },
];

// Default empty state if needed
export const DEFAULT_EMPTY_NODES: DialogueNode[] = [];
export const DEFAULT_EMPTY_EDGES: DialogueEdge[] = [];