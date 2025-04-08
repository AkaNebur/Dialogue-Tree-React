// src/components/DialogueFlow/DialogueNode.tsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { DialogueNodeProps } from '../../types';

/**
 * Custom node component for dialogue tree with better dark mode support
 */
const DialogueNode: React.FC<DialogueNodeProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  id,
  type, // Used to check if it's a start node
}) => {
  // Access className from the data object
  const nodeClassName = data.className || '';

  // Apply dialogue-node class to all nodes EXCEPT the start node (input type)
  const baseClassName = type === 'input' ? '' : 'dialogue-node';
  
  return (
    <div className={`${baseClassName} ${nodeClassName} transition-all duration-200 hover:shadow-lg`}>
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

export default memo(DialogueNode);