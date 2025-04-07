import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * Custom node component for dialogue tree
 *
 * @param {Object} props - Component props
 * @param {Object} props.data - Node data including label and className
 * @param {boolean} props.isConnectable - Whether node is connectable
 * @param {string} props.id - Node id (passed by React Flow)
 * @param {Object} props.sourcePosition - Position for source handle
 * @param {Object} props.targetPosition - Position for target handle
 * @param {string} props.type - Node type (e.g., 'input', 'custom')
 */
const DialogueNode = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  id,
  type, // Added type prop to check if it's a start node
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