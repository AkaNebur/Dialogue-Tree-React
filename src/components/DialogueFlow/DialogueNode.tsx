import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData } from '../../types';

interface DialogueNodeComponentProps extends NodeProps<DialogueNodeData> {}

const DialogueNodeComponent: React.FC<DialogueNodeComponentProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
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

  return (
    <div className={nodeContainerClasses}>
      {type !== 'input' && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          className="!w-16 !h-3 !border-0 !rounded-none !bg-teal-500 dark:!bg-teal-400 transition-colors duration-200 hover:!bg-blue-500"
        />
      )}

      <div className="text-sm font-medium w-full">
        {data.label}
      </div>

      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className="!w-16 !h-3 !border-0 !rounded-none !bg-teal-500 dark:!bg-teal-400 transition-colors duration-200 hover:!bg-blue-500"
      />
    </div>
  );
};

const DialogueNode = React.memo(DialogueNodeComponent);

export default DialogueNode;