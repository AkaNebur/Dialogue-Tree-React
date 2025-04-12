// src/components/DialogueFlow/NpcNode.tsx
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import CharacterNodeBase from './CharacterNodeBase'; // Import the base component
import { DialogueNodeData } from '../../types';
import { useSidebarData } from '../../store/dialogueStore'; // Hook to get selected NPC info

interface NpcNodeProps extends NodeProps<DialogueNodeData> {}

/**
 * Wrapper component for NPC nodes.
 * Fetches the selected NPC's data (name, image, accentColor)
 * and passes it to the CharacterNodeBase component.
 */
const NpcNodeComponent: React.FC<NpcNodeProps> = (props) => {
  // Get the currently selected NPC's data from the store
  const { selectedNpc } = useSidebarData();

  return (
    <CharacterNodeBase
      {...props} // Pass all original React Flow NodeProps
      nodeType="npc"
      characterName={selectedNpc?.name}
      characterImage={selectedNpc?.image}
      accentColor={selectedNpc?.accentColor} // Pass the accent color to the base component
    />
  );
};

// Memoize the component for performance optimization
export default memo(NpcNodeComponent);