// File: src/components/DialogueFlow/JumpNode.tsx

import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArrowRightCircle, AlertTriangle } from 'lucide-react';
import { DialogueNodeData } from '../../types';
import { useDialogueStore } from '../../store/dialogueStore';
import Button from '../ui/Button';
import { colors, typography } from '../../styles/commonStyles';

interface JumpNodeProps extends NodeProps<DialogueNodeData> {}

const JumpNodeComponent: React.FC<JumpNodeProps> = ({
  data,
  id,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
}) => {
  const { targetNpcId, targetConversationId, label } = data;

  const jumpToConversation = useDialogueStore((state) => state.jumpToConversation);
  // Use getState for synchronous access to avoid extra re-renders from selector
  const npcs = useDialogueStore.getState().npcs;

  // Find target NPC and Conversation names
  const targetInfo = useMemo(() => {
    if (!targetNpcId || !targetConversationId) {
      return { npcName: null, convName: null, found: false };
    }
    const npc = npcs.find(n => n.id === targetNpcId);
    const conv = npc?.conversations.find(c => c.id === targetConversationId);
    return {
      npcName: npc?.name || 'Unknown NPC',
      convName: conv?.name || 'Unknown Dialogue',
      found: !!(npc && conv)
    };
  }, [targetNpcId, targetConversationId, npcs]);

  const handleJump = () => {
    if (targetNpcId && targetConversationId && targetInfo.found) {
      jumpToConversation(targetNpcId, targetConversationId);
    } else {
      console.warn(`JumpNode ${id}: Cannot jump, target not found or specified.`);
      // Consider adding temporary UI feedback for missing target
    }
  };

  const nodeBaseClasses = `
    jump-node
    p-3 rounded-lg border-2 bg-purple-900/30 border-purple-600
    text-gray-200 shadow-md w-[250px] flex flex-col gap-2
    transition-colors duration-200
  `;

  return (
    <div className={nodeBaseClasses}>
      {/* Target Handle */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="!transition-colors !duration-150"
        id={`target-${id}`}
      />

      {/* Node Title */}
      <div className={`${typography.body.md} font-semibold truncate`}>
        {label || 'Jump Node'}
      </div>

      {/* Target Info Display */}
      <div className={`text-xs ${colors.text.secondary}`}>
        {targetInfo.found ? (
          <>Jumps to: <span className="font-medium text-gray-300">{targetInfo.npcName} / {targetInfo.convName}</span></>
        ) : targetNpcId && targetConversationId ? (
            // Show warning if IDs exist but target wasn't found (e.g., deleted)
            <span className="flex items-center gap-1 text-yellow-400">
                <AlertTriangle size={12} /> Target not found!
            </span>
        ) : (
          // Show if no target IDs are set
          'No target selected.'
        )}
      </div>

      {/* Jump Button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleJump}
        disabled={!targetInfo.found} // Disable if target isn't valid
        leftIcon={<ArrowRightCircle size={16} />}
        fullWidth
        title={targetInfo.found ? `Jump to ${targetInfo.npcName} - ${targetInfo.convName}` : "Select a valid target dialogue first"}
      >
        Go to Dialogue
      </Button>

      {/* Source Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className="!transition-colors !duration-150"
        id={`source-${id}`}
      />
    </div>
  );
};

export default memo(JumpNodeComponent);