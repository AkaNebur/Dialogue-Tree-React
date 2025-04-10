import { Position } from 'reactflow';
import { NodeDimensions, LayoutConstants, DialogueNode, DialogueEdge, NPC, Conversation } from '../types';
import IdManager from '../utils/IdManager'; // Import the instance

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

export const createInitialConversationData = (conversationName = "New Conversation"): Pick<Conversation, 'nodes' | 'edges'> => {
  const startNodeId = getNextNodeId();
  return {
    nodes: [
      {
        id: startNodeId,
        type: 'input',
        data: {
          label: `Start: ${conversationName}`,
          className: 'node-start',
        },
        position: { x: 250, y: 50 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      },
    ],
    edges: [],
  };
};

export const initialNpcs: NPC[] = [];

export const DEFAULT_EMPTY_NODES: DialogueNode[] = [];
export const DEFAULT_EMPTY_EDGES: DialogueEdge[] = [];