// File: src/types/index.ts
import { Node, Edge, Position, XYPosition, NodeChange, EdgeChange, Connection } from 'reactflow';

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
  label: string; // This will now act as the node's title/identifier in the header
  className?: string;
  text?: string; // New field for the body content
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
  conversations: Conversation[];
}

export interface NodePositions {
  [nodeId: string]: XYPosition;
}

// Props for UI Components that still receive props from parent (App)
export interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
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

// Hook Return Types (Keep hooks that still exist)
export interface UseLayoutToggleReturn {
  isHorizontal: boolean;
  toggleLayout: () => void;
  setLayout: (horizontal: boolean) => void;
  direction: 'horizontal' | 'vertical';
}

export type UseAutoLayoutReturn = () => void;