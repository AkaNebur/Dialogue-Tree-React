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
  sourcePosition = Position.Right, // Default is used if not provided by store/React Flow
  targetPosition = Position.Left,  // Default is used if not provided by store/React Flow
}) => {
  const { selectedNpc } = useSidebarData();

  // --- Handle Rotation Logic ---
  const isHorizontalLayout = sourcePosition === Position.Left || sourcePosition === Position.Right;
  const handleBaseClasses = "!border-0 !rounded-none !bg-teal-500 dark:!bg-teal-400 transition-colors duration-200 hover:!bg-blue-500";
  const handleOrientationClasses = isHorizontalLayout
    ? "!w-3 !h-16" // Tall rectangle for Left/Right positions
    : "!w-16 !h-3"; // Wide rectangle for Top/Bottom positions
  const handleCombinedClasses = `${handleBaseClasses} ${handleOrientationClasses}`;
  // --- End Handle Rotation Logic ---

  return (
    <div className={nodeContainerBaseClasses + ' border-blue-200 dark:border-gray-600'}>
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
        className={handleCombinedClasses} // Apply dynamic classes
      />
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className={handleCombinedClasses} // Apply dynamic classes
      />
    </div>
  );
};

export default memo(NpcNodeComponent);