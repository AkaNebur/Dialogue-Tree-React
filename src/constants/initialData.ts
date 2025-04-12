// File: src/constants/initialData.ts
import { Position } from 'reactflow';
import { NodeDimensions, LayoutConstants, DialogueNode, DialogueEdge, NPC, Conversation } from '../types';
import IdManager from '../utils/IdManager';

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

export const generateNpcId = (): string => {
  return IdManager.generateNpcId();
};

export const generateConversationId = (): string => {
  return IdManager.generateConversationId();
};

export const getNextNodeId = (): string => {
  return IdManager.generateNodeId();
};

export const createInitialConversationData = (
  conversationName = "New Conversation", 
  isHorizontal = true
): Pick<Conversation, 'nodes' | 'edges'> => {
  const startNodeId = getNextNodeId();
  return {
    nodes: [
      {
        id: startNodeId,
        type: 'input',
        data: {
          label: `Start: ${conversationName}`,
          className: 'node-start',
          text: `This is the starting point of the '${conversationName}' dialogue.`,
        },
        position: { x: 250, y: 50 },
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
      },
    ],
    edges: [],
  };
};

// Default accent color for new NPCs
export const DEFAULT_NPC_ACCENT_COLOR = '#4f46e5';
// Default layout direction for new NPCs
export const DEFAULT_NPC_LAYOUT_HORIZONTAL = true;

export const initialNpcs: NPC[] = [];

export const DEFAULT_EMPTY_NODES: DialogueNode[] = [];
export const DEFAULT_EMPTY_EDGES: DialogueEdge[] = [];