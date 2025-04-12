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
  selected, // Destructure selected prop
}) => {
  const nodeClassName = data.className || ''; // User-provided class from initialData (e.g., 'node-start')

  // --- Apply base styling consistently, allow override ---
  // dialogue-node-base provides padding, border, etc.
  const baseNodeStyles = "dialogue-node-base";

  // Specific styles for the input node content (the dashed box)
  const inputNodeContentStyles = `
    p-3 border border-dashed border-blue-400 dark:border-blue-600
    bg-blue-50 dark:bg-blue-900/30 rounded-md
    text-center text-blue-700 dark:text-blue-300 text-sm
    min-w-[180px] w-full  // Ensure it fills the container
  `;

  const nodeContainerClasses = [
    baseNodeStyles, // Apply base styles to all
    type === 'input' ? 'node-input-container' : '', // Specific class for input container if needed
    nodeClassName, // Add specific class like 'node-start'
    // Selection is handled globally in index.css now, referencing the base class '.dialogue-node-base'
  ].filter(Boolean).join(' ');


  // --- Handle Styling (remains the same) ---
  const isHorizontalLayout = sourcePosition === Position.Left || sourcePosition === Position.Right;
  const handleBaseClasses = `
    !border
    !rounded-sm          // Subtle rounding
    !bg-blue-500         // Primary blue
    dark:!bg-blue-600
    !border-blue-300     // Lighter border for definition
    dark:!border-blue-700
    transition-colors
    duration-150
    hover:!bg-blue-600     // Darken on hover
    hover:dark:!bg-blue-500 // Lighten dark on hover slightly
    hover:!border-blue-400 // Adjust border on hover
    hover:dark:!border-blue-600
  `;
  const handleOrientationClasses = isHorizontalLayout
    ? "!w-2 !h-10" // Adjusted size: Tall and thin
    : "!w-10 !h-2"; // Adjusted size: Wide and thin

  const handleCombinedClasses = `${handleBaseClasses} ${handleOrientationClasses}`;
  // --- End Handle Styling ---

  return (
    // Apply the combined container classes to the root div
    <div className={nodeContainerClasses}>

      {/* Conditional Rendering based on Node Type */}
      {type === 'input' ? (
        // --- Input Node Rendering ---
        <>
          {/* Content of the start node */}
          <div className={inputNodeContentStyles}>
            {data.label}
          </div>
          {/* Input nodes ONLY have a source handle */}
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
            className={handleCombinedClasses}
          />
        </>
      ) : (
        // --- Default/Custom Node Rendering ---
        <>
          <Handle
            type="target"
            position={targetPosition}
            isConnectable={isConnectable}
            className={handleCombinedClasses}
          />
          {/* Default Node Content Area */}
          <div className="p-3"> {/* Use padding from base class */}
            <div className="text-sm font-medium w-full">
              {data.label}
            </div>
             {/* Render text if available for generic nodes */}
            {data.text && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">
                    {data.text}
                </div>
            )}
          </div>
          <Handle
            type="source"
            position={sourcePosition}
            isConnectable={isConnectable}
            className={handleCombinedClasses}
          />
        </>
      )}
    </div>
  );
};

const DialogueNode = React.memo(DialogueNodeComponent);

export default DialogueNode;