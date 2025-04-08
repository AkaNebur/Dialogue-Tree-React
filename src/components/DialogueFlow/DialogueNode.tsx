import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { DialogueNodeProps } from '../../types';

/**
 * Custom node component for dialogue tree
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
  const nodeClassName = data.className || ''; // Use data.className, provide fallback

  return (
    // Use the className from the data prop
    <div className={`dialogue-node ${nodeClassName}`}>
      {/* Target handle (input connection) - only render if not a start node */}
      {type !== 'input' && (
        <Handle
          type="target"
          position={targetPosition}
          isConnectable={isConnectable}
          className="w-3 h-3"
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
        className="w-3 h-3"
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(DialogueNode);