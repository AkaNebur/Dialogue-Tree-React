import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Custom node component for dialogue tree
 * 
 * @param {Object} props - Component props
 * @param {Object} props.data - Node data including label
 * @param {boolean} props.isConnectable - Whether node is connectable
 * @param {string} props.className - Custom class name for styling
 * @param {Object} props.sourcePosition - Position for source handle
 * @param {Object} props.targetPosition - Position for target handle
 */
const DialogueNode = ({ 
  data, 
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  className
}) => {
  return (
    <div className={`dialogue-node ${className}`}>
      {/* Target handle (input connection) */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
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