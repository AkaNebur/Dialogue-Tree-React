// src/components/DialogueFlow/DialogueNode.tsx
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData } from '../../types'; // Adjust path if necessary

interface DialogueNodeComponentProps extends NodeProps<DialogueNodeData> {}

const DialogueNodeComponent: React.FC<DialogueNodeComponentProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  type, // Used to check if it's a start node
  selected, // Destructure the selected prop
}) => {
  // --- Get the specific className from data (e.g., 'node-start', 'node-hello') ---
  const nodeClassName = data.className || '';

  // --- Determine the base class (apply 'dialogue-node' only to non-start nodes) ---
  const baseClassName = type === 'input' ? '' : 'dialogue-node';

  // --- Combine all classes ---
  const nodeContainerClasses = [
    baseClassName, // Will be empty for start node, 'dialogue-node' for others
    nodeClassName, // <<< CRUCIAL: This adds 'node-start' or 'node-hello', etc.
    'transition-all',
    'duration-200',
    'hover:shadow-lg',
    // Apply selection styles conditionally
    selected
      ? 'border-2 border-blue-500 dark:border-blue-400 ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 ring-offset-white dark:ring-offset-dark-bg'
      : '', // Remove the default 'border' here if base/nodeClassName already defines one
             // If your .node-start and .dialogue-node already have 'border' or 'border-2', etc., you don't need the fallback 'border' here.
             // Let's assume they do, and remove the fallback 'border'
  ].filter(Boolean).join(' '); // Filter out empty strings and join

  return (
    <div className={nodeContainerClasses}> {/* Apply combined classes */}
      {/* Target handle (input connection) - only render if not a start node */}
      {type !== 'input' && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          className="w-3 h-3 transition-colors duration-200 hover:bg-blue-500"
        />
      )}

      {/* Node content */}
      <div className="text-sm font-medium">
        {data.label}
      </div>

      {/* Source handle (output connection) */}
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className="w-3 h-3 transition-colors duration-200 hover:bg-blue-500"
      />
    </div>
  );
};

const DialogueNode = React.memo(DialogueNodeComponent);

export default DialogueNode;