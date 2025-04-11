// File: src/components/DialogueFlow/UserNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react';
import { DialogueNodeData } from '../../types';

interface UserNodeProps extends NodeProps<DialogueNodeData> {}

const UserNodeComponent: React.FC<UserNodeProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  selected,
}) => {
  const nodeClasses = [
    'user-node',
    // 'px-4 py-3',
    'shadow-md rounded-lg',
    'bg-white dark:bg-gray-800', // Adjusted background
    'border-2',
    selected
      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 ring-offset-white dark:ring-offset-gray-800' // Adjusted ring offset
      : 'border-gray-200 dark:border-gray-600', // Default border
    'transition-all duration-200',
    'min-w-[200px]', // Slightly wider maybe
    'flex flex-col', // Make it a column flex container
  ].filter(Boolean).join(' ');

  const headerClasses = "flex items-center p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 rounded-t-lg";
  const bodyClasses = "p-3 text-sm text-gray-700 dark:text-gray-300 break-words";
  const placeholderClasses = "text-xs italic text-gray-400 dark:text-gray-500";

  return (
    <div className={nodeClasses}>
      {/* Node Header */}
      <div className={headerClasses}>
        {/* User Icon */}
        <div className="flex-shrink-0 rounded-full w-8 h-8 flex justify-center items-center bg-gray-200 dark:bg-gray-600 mr-2 border border-gray-300 dark:border-gray-500">
          <User size={16} className="text-gray-600 dark:text-gray-300" />
        </div>
        {/* Title/Label Area */}
        <div className="flex-grow">
          {/* Static User Dialogue Title */}
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
            User Dialogue
          </div>
          {/* Dynamic Node Title (from data.label) */}
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
            {data.label || 'User Response'}
          </div>
        </div>
      </div>

      {/* Node Body */}
      <div className={bodyClasses}>
        {data.text ? (
            <div className="whitespace-pre-wrap">{data.text}</div>
        ) : (
            <div className={placeholderClasses}>No text entered.</div>
        )}
      </div>

      {/* Ensure Handles are positioned correctly relative to the main node div */}
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

export default memo(UserNodeComponent);