// src/types/index.ts
import { Node, Edge, Position, XYPosition } from 'reactflow';

// Node dimensions and layout constants
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

// DialogueNode data
export interface DialogueNodeData {
  label: string;
  className?: string;
}

// Define the type for our custom nodes
export type DialogueNode = Node<DialogueNodeData>;
export type DialogueEdge = Edge;

// Define Conversation structure
export interface Conversation {
  id: string;
  name: string;
  nodes: DialogueNode[];
  edges: DialogueEdge[];
}

// Define NPC structure
export interface NPC {
  id: string;
  name: string;
  conversations: Conversation[];
}

// Node relationships for layout calculations
export interface NodeRelationship {
  children: string[];
  parents: string[];
  level: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface NodeRelationships {
  [nodeId: string]: NodeRelationship;
}

export interface NodeLevels {
  [level: number]: string[];
}

export interface NodePositions {
  [nodeId: string]: XYPosition;
}

// Props for components
export interface SidebarProps {
  npcs: NPC[];
  selectedNpcId: string | null;
  selectedConversationId: string | null;
  onSelectNpc: (npcId: string) => void;
  onAddNpc: (name: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onAddConversation: (npcId: string, name: string) => void;
}

export interface HeaderProps {
  isHorizontal: boolean;
  onToggleLayout: () => void;
  onFitView?: () => void;
}

export interface DialogueFlowProps {
  nodes: DialogueNode[];
  edges: DialogueEdge[];
  setNodes: React.Dispatch<React.SetStateAction<DialogueNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<DialogueEdge[]>>;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: any) => void;
  isHorizontal: boolean;
  updateNodePositions: (positions: NodePositions) => void;
  onInitialized: (layoutFn: () => void) => void;
  onFitViewInitialized: (fitViewFn: () => void) => void;
  selectedConversationId: string | null;
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

// Hook return types
export interface UseDialogueManagerReturn {
  npcs: NPC[];
  selectedNpcId: string | null;
  selectedConversationId: string | null;
  selectedNpc: NPC | undefined;
  selectedConversation: Conversation | undefined;
  activeNodes: DialogueNode[];
  activeEdges: DialogueEdge[];
  setNodes: React.Dispatch<React.SetStateAction<DialogueNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<DialogueEdge[]>>;
  addNpc: (name: string) => void;
  selectNpc: (npcId: string) => void;
  addConversation: (npcId: string, name: string) => void;
  selectConversation: (conversationId: string) => void;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: any) => void;
  updateNodePositions: (positions: NodePositions) => void;
  updateNodeLayout: (isHorizontal: boolean) => void;
}

export interface UseLayoutToggleReturn {
  isHorizontal: boolean;
  toggleLayout: () => void;
}

export interface UseResizableSidebarReturn {
  sidebarWidth: number;
  isDragging: boolean;
  startResize: (e: React.MouseEvent) => void;
}

export interface UseAutoLayoutReturn {
  (): void;
}