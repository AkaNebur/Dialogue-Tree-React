// src/components/DialogueFlow/NpcNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react'; // Fallback icon
import { DialogueNodeData } from '../../types'; // Adjust path if necessary
import { useSidebarData } from '../../store/dialogueStore'; // Import hook to get selected NPC

// Define props specific to this node
interface NpcNodeProps extends NodeProps<DialogueNodeData> {}

const NpcNodeComponent: React.FC<NpcNodeProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  selected,
}) => {
  // Get the currently selected NPC from the Zustand store
  const { selectedNpc } = useSidebarData();

  // Base styling - adjust colors (e.g., bg-blue-100 dark:bg-blue-900)
  const nodeClasses = [
    'npc-node', // Add a specific class
    'px-4 py-3',
    'shadow-md rounded-lg',
    'bg-blue-50 dark:bg-blue-900/80', // NPC node color scheme (matches sidebar slightly)
    'border-2',
    selected
      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 ring-offset-white dark:ring-offset-dark-bg'
      : 'border-blue-200 dark:border-blue-800', // Default border
    'transition-all duration-200',
    'min-w-[180px]',
  ].filter(Boolean).join(' ');

  return (
    <div className={nodeClasses}>
      <div className="flex items-center">
        {/* NPC Image or Fallback Icon */}
        <div className="flex-shrink-0 rounded-full w-10 h-10 flex justify-center items-center bg-gray-200 dark:bg-gray-700 mr-3 overflow-hidden border border-gray-300 dark:border-gray-600">
          {selectedNpc?.image ? (
            <img
              src={selectedNpc.image}
              alt={selectedNpc.name || 'NPC'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
        {/* NPC Name and Dialogue Text */}
        <div className="flex-grow">
          {selectedNpc && (
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 truncate">
              {selectedNpc.name || 'NPC'}
            </div>
          )}
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
            {data.label || 'NPC Response'}
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-blue-400"
      />
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-blue-400"
      />
    </div>
  );
};

export default memo(NpcNodeComponent);