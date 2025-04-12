// src/components/DialogueFlow/UserNode.tsx
import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import CharacterNodeBase from './CharacterNodeBase'; // Import the base component
import { DialogueNodeData } from '../../types';

interface UserNodeProps extends NodeProps<DialogueNodeData> {}

const UserNodeComponent: React.FC<UserNodeProps> = (props) => {
  return (
    <CharacterNodeBase
      {...props} // Pass all original props
      nodeType="user"
      // No characterName or characterImage needed for User node
    />
  );
};

export default memo(UserNodeComponent);