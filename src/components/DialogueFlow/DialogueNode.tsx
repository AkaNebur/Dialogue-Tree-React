// File: src/components/DialogueFlow/DialogueNode.tsx

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { DialogueNodeData } from '../../types';
import { colors } from '../../styles/commonStyles'; // Import common styles
import MarkdownRenderer from '../Markdown/MarkdownRenderer'; // Import MarkdownRenderer

interface DialogueNodeComponentProps extends NodeProps<DialogueNodeData> {}

const DialogueNodeComponent: React.FC<DialogueNodeComponentProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right, // Keep defaults
  targetPosition = Position.Left,  // Keep defaults
  type, // Keep type to differentiate input/custom
}) => {
  const nodeClassName = data.className || ''; // User-provided class (e.g., 'node-start')

  // --- Style Definitions using Tailwind ---
  // Base styles for default/custom nodes (rely on class defined in index.css)
  const baseNodeStyles = "custom-node"; // Points to the style defined in index.css

  // Specific styles for the input node content (using Tailwind)
  const inputNodeContentStyles = `
    input-node-content p-3 border border-dashed rounded-md text-center text-sm font-medium w-full
  `;
  // Note: The specific colors (border, bg, text) for input-node-content
  // are now defined directly within index.css for better theme management.

  // Container class combines base and specific classes
  const nodeContainerClasses = [
    // Apply 'dialogue-node-base' for default nodes, but NOT for input nodes
    // Input nodes get their styling via 'input-node-wrapper' + direct content styles
    type !== 'input' ? baseNodeStyles : 'dialogue-node-input-wrapper', // Wrapper for input nodes
    nodeClassName, // Add specific class like 'node-start'
    'react-flow__node-' + (type || 'default'), // Add standard React Flow type class
  ].filter(Boolean).join(' ');

  return (
    <div className={nodeContainerClasses}>
      {/* Conditional Rendering based on Node Type */}
      {type === 'input' ? (
        // --- Input Node Rendering ---
        <>
          {/* Content of the start node - styled directly */}
          <div className={inputNodeContentStyles}>
            {data.label}
          </div>
          {/* Input nodes ONLY have a source handle */}
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
         />
        </>
      ) : (
        // --- Default/Custom Node Rendering ---
        <>
          {/* Target Handle */}
          <Handle
            type="target"
            position={targetPosition}
            isConnectable={isConnectable}
          />
          {/* Default Node Content Area (padding comes from dialogue-node-base) */}
          <div className="custom-node-content p-3">
            <div className={`custom-node-title text-sm font-medium w-full ${colors.text.primary}`}>
              {data.label}
             </div>
             {/* Render text if available */}
            {data.text && (
                <div className={`text-xs ${colors.text.secondary} mt-1 break-words`}>
                    {/* Using MarkdownRenderer for potential formatting */}
                    <MarkdownRenderer markdown={data.text} />
                </div>
            )}
          </div>
          {/* Source Handle */}
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
          />
        </>
      )}
    </div>
  );
};

const DialogueNode = React.memo(DialogueNodeComponent);

export default DialogueNode;