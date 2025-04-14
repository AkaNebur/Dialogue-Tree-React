// src/components/DialogueFlow/NpcNode.tsx
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import CharacterNodeBase from './CharacterNodeBase'; // Import the base component
import { DialogueNodeData } from '../../types';
// --- MODIFIED: Import full store to get all NPCs ---
import { useDialogueStore } from '../../store/dialogueStore'; // Hook to get selected NPC info

interface NpcNodeProps extends NodeProps<DialogueNodeData> {}

/**
 * Wrapper component for NPC nodes.
 * Fetches the specific NPC's data based on the node's data.npcId
 * and passes it to the CharacterNodeBase component.
 */
const NpcNodeComponent: React.FC<NpcNodeProps> = (props) => {
  // --- Get all NPCs from the store ---
  const npcs = useDialogueStore(state => state.npcs);

  // --- Find the NPC associated with *this specific node* using props.data.npcId ---
  const associatedNpc = npcs.find(npc => npc.id === props.data.npcId);

  // --- Determine name, image, and color from the associated NPC ---
  const characterName = associatedNpc?.name;
  const characterImage = associatedNpc?.image;
  const accentColor = associatedNpc?.accentColor; // Pass the accent color to the base component

  // --- Handle case where NPC might not be found (e.g., deleted) ---
  if (!associatedNpc && props.data.npcId) {
      console.warn(`NpcNode: Associated NPC with ID ${props.data.npcId} not found for node ${props.id}.`);
      // Optionally provide default/fallback display here
  }

  return (
    <CharacterNodeBase
      {...props} // Pass all original React Flow NodeProps
      nodeType="npc"
      // --- Pass the data of the *associated* NPC ---
      characterName={characterName || 'Unknown NPC'} // Fallback name if NPC not found
      characterImage={characterImage}
      accentColor={accentColor} // Pass the accent color to the base component
    />
  );
};

// Memoize the component for performance optimization
export default memo(NpcNodeComponent);