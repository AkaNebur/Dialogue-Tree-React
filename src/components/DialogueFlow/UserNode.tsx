// src/components/DialogueFlow/UserNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react';
import { DialogueNodeData } from '../../types'; // Adjust path if necessary

// Define props specific to this node, extending React Flow's NodeProps
interface UserNodeProps extends NodeProps<DialogueNodeData> {}

const UserNodeComponent: React.FC<UserNodeProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right, // Default, adjust based on layout direction if needed
  targetPosition = Position.Left,  // Default, adjust based on layout direction if needed
  selected, // Destructure the selected prop
}) => {
  // Base styling - adjust colors (e.g., bg-teal-100 dark:bg-teal-900) as desired
  const nodeClasses = [
    'user-node', // Add a specific class for potential global styling
    'px-4 py-3',
    'shadow-md rounded-lg',
    'bg-gray-100 dark:bg-gray-700', // User node color scheme
    'border-2',
    selected
      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 ring-offset-white dark:ring-offset-dark-bg'
      : 'border-gray-300 dark:border-gray-600', // Default border
    'transition-all duration-200',
    'min-w-[180px]', // Ensure minimum width
  ].filter(Boolean).join(' ');

  return (
    <div className={nodeClasses}>
      <div className="flex items-center">
        {/* User Icon */}
        <div className="flex-shrink-0 rounded-full w-10 h-10 flex justify-center items-center bg-gray-200 dark:bg-gray-600 mr-3 border border-gray-300 dark:border-gray-500">
          <User size={20} className="text-gray-600 dark:text-gray-300" />
        </div>
        {/* Dialogue Text */}
        <div className="flex-grow">
          {/* Optional: Add a small label indicating it's the user */}
          {/* <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">User Says:</div> */}
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
            {data.label || 'User Response'}
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-blue-400" // Use !important Tailwind syntax if needed
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

// Memoize for performance
export default memo(UserNodeComponent);