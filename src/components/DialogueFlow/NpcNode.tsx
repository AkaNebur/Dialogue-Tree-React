// src/components/DialogueFlow/NpcNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react';
import { DialogueNodeData } from '../../types';
import { useSidebarData } from '../../store/dialogueStore';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';

// --- Consistent Style Definitions ---
const nodeContainerBaseClasses = "npc-node shadow-md rounded-lg bg-white dark:bg-dark-surface border-2 w-[250px] flex flex-col overflow-hidden transition-all duration-200";
const nodeHeaderClasses = "flex items-center p-2 border-b rounded-t-lg";
const npcHeaderBgClasses = "bg-blue-50 dark:bg-blue-900/80 border-blue-200 dark:border-blue-800";
const nodeBodyClasses = "p-3 text-sm text-gray-700 dark:text-gray-300 break-words";
const nodePlaceholderClasses = "text-xs italic text-gray-400 dark:text-gray-500";
const nodeIconContainerClasses = "flex-shrink-0 rounded-full w-8 h-8 flex justify-center items-center mr-2 overflow-hidden border border-gray-300 dark:border-gray-500";
const nodeTitleLabelClasses = "text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-300 truncate";
const nodeTitleNameClasses = "text-sm font-semibold text-gray-800 dark:text-gray-100 truncate";
// --- End Style Definitions ---

interface NpcNodeProps extends NodeProps<DialogueNodeData> {}

const NpcNodeComponent: React.FC<NpcNodeProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
}) => {
  const { selectedNpc } = useSidebarData();

  // --- Updated Handle Styling ---
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
    ? "!w-2 !h-10" // Tall and thin
    : "!w-10 !h-2"; // Wide and thin

  const handleCombinedClasses = `${handleBaseClasses} ${handleOrientationClasses}`;
  // --- End Updated Handle Styling ---

  return (
    // Using specific class 'npc-node' for potential global CSS targeting
    <div className={nodeContainerBaseClasses + ' border-blue-200 dark:border-gray-600 npc-node'}>
      <div className={`${nodeHeaderClasses} ${npcHeaderBgClasses}`}>
        <div className={`${nodeIconContainerClasses} bg-gray-200 dark:bg-gray-700`}>
          {selectedNpc?.image ? (
            <img
              src={selectedNpc.image}
              alt={selectedNpc.name || 'NPC'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          {selectedNpc && (
            <div className={nodeTitleLabelClasses}>
              {selectedNpc.name || 'NPC'}
            </div>
          )}
          <div className={nodeTitleNameClasses}>
            {data.label || 'NPC Response'}
          </div>
        </div>
      </div>

      <div className={nodeBodyClasses}>
        {data.text ? (
            <MarkdownRenderer markdown={data.text} />
        ) : (
            <div className={nodePlaceholderClasses}>No text entered.</div>
        )}
      </div>

      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className={handleCombinedClasses}
      />
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className={handleCombinedClasses}
      />
    </div>
  );
};

export default memo(NpcNodeComponent);