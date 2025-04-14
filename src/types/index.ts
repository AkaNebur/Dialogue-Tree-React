// File: src/types/index.ts
import { Node, Edge, Position, XYPosition } from 'reactflow';

export type PositioningMode = 'dagre' | 'manual';

export interface NodeDimensions {
  WIDTH: number;
  HEIGHT: number;
}

export interface LayoutConstants {
  HORIZONTAL_NODE_DISTANCE: number;
  VERTICAL_NODE_DISTANCE: number;
  HORIZONTAL_LEVEL_DISTANCE: number;
  VERTICAL_LEVEL_DISTANCE: number;
  INITIAL_X_OFFSET: number;
  INITIAL_Y_OFFSET: number;
}

export interface DialogueNodeData {
  label: string; // Node's title/identifier in the header
  className?: string;
  text?: string; // Body content
  npcId?: string; // ID of the associated NPC for 'npc' type nodes
}

export type DialogueNode = Node<DialogueNodeData>;
export type DialogueEdge = Edge;

export interface Conversation {
  id: string;
  name: string;
  nodes: DialogueNode[];
  edges: DialogueEdge[];
}

export interface NPC {
  id: string;
  name: string;
  image?: string;
  accentColor?: string;
  isHorizontal?: boolean; // NPC-specific layout direction
  conversations: Conversation[];
}

export interface NodePositions {
  [nodeId: string]: XYPosition;
}

// Props for UI Components that still receive props from parent (App)
export interface HeaderProps {
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
}

export interface DialogueFlowProps {
  isHorizontal: boolean;
  onFitViewInitialized: (fitViewFn: () => void) => void;
}

export interface DialogueNodeProps {
  data: DialogueNodeData;
  isConnectable: boolean;
  sourcePosition?: Position;
  targetPosition?: Position;
  id: string;
  type?: string;
}

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'right' | 'left' | 'top' | 'bottom';
}

// Hook Return Types
export interface UseLayoutToggleReturn {
  isHorizontal: boolean;
  toggleLayout: () => void;
  setLayout: (horizontal: boolean) => void;
  direction: 'horizontal' | 'vertical';
}

export type UseAutoLayoutReturn = () => void;