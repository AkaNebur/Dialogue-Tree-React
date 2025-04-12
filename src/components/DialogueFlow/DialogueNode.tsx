import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData } from '../../types';

interface DialogueNodeComponentProps extends NodeProps<DialogueNodeData> {}

const DialogueNodeComponent: React.FC<DialogueNodeComponentProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right, // Default is used if not provided by store/React Flow
  targetPosition = Position.Left,  // Default is used if not provided by store/React Flow
  type,
  selected,
}) => {
  const nodeClassName = data.className || '';
  const baseClassName = type === 'input' ? '' : 'dialogue-node'; // Generic class for non-specific custom nodes

  const nodeContainerClasses = [
    baseClassName,
    nodeClassName,
    'transition-all',
    'duration-200',
    'hover:shadow-lg',
    selected
      ? 'border-2 border-blue-500 dark:border-blue-400 ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 ring-offset-white dark:ring-offset-dark-bg'
      : '',
  ].filter(Boolean).join(' ');

  // --- Handle Rotation Logic ---
  const isHorizontalLayout = sourcePosition === Position.Left || sourcePosition === Position.Right;
  const handleBaseClasses = "!border-0 !rounded-none !bg-teal-500 dark:!bg-teal-400 transition-colors duration-200 hover:!bg-blue-500";
  const handleOrientationClasses = isHorizontalLayout
    ? "!w-3 !h-16" // Tall rectangle for Left/Right positions
    : "!w-16 !h-3"; // Wide rectangle for Top/Bottom positions
  const handleCombinedClasses = `${handleBaseClasses} ${handleOrientationClasses}`;
  // --- End Handle Rotation Logic ---

  return (
    <div className={nodeContainerClasses}>
      {type !== 'input' && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          className={handleCombinedClasses} // Apply dynamic classes
        />
      )}

      <div className="text-sm font-medium w-full">
        {data.label}
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className={handleCombinedClasses} // Apply dynamic classes
      />
    </div>
  );
};

const DialogueNode = React.memo(DialogueNodeComponent);

export default DialogueNode;