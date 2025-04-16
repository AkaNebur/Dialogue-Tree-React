// File: src/components/NodeInfoPanel/index.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { NodeChange } from 'reactflow';
import { useNodeInfoPanelData } from '../../store/dialogueStore';
import Input from '../ui/Input';
import Panel from '../ui/Panel';
import Select, { SelectOption } from '../ui/Select';
import IconButton from '../ui/IconButton';
import { typography } from '../../styles/commonStyles';
import MarkdownEditor from '../Markdown/MarkdownEditor';

const NodeInfoPanel: React.FC = () => {
  const {
    selectedNode: node,
    onNodesChange,
    updateNodeData,
    updateNodeText,
    updateNodeType,
    updateNodeNpcId,
    updateNodeTargetConversation, // Action for jump node target
    availableNodeTypes,
    npcOptions,
    allConversationsForDropdown, // Selector for jump node target dropdown
  } = useNodeInfoPanelData();

  const [label, setLabel] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const prevNodeId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with selected node from global store
  useEffect(() => {
    if (node && node.id !== prevNodeId.current) {
      setLabel(node.data.label || '');
      setText(node.data.text || '');
      setSelectedType(node.type || 'custom');
      prevNodeId.current = node.id;
    } else if (!node) {
      // Reset local state if no node is selected
      setLabel('');
      setText('');
      setSelectedType('');
      prevNodeId.current = null;
    }
  }, [node]);

  const handleLabelBlur = () => {
    if (node && label.trim() && label.trim() !== node.data.label) {
      updateNodeData(node.id, label.trim());
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (node) updateNodeText(node.id, newText);
    }, 50); // Short debounce for text input
  };

  const handleTextBlur = () => {
    // Ensure latest text is saved on blur, clearing any pending debounce
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (node && text !== (node.data.text || '')) {
      updateNodeText(node.id, text);
    }
  };

  const handleLabelKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!node) return;
    if (event.key === 'Enter') {
      if (label.trim() && label.trim() !== node.data.label) {
        updateNodeData(node.id, label.trim());
      }
      inputRef.current?.blur();
    } else if (event.key === 'Escape') {
      setLabel(node.data.label || ''); // Reset on escape
      inputRef.current?.blur();
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    if (node && newType !== selectedType) {
      setSelectedType(newType);
      updateNodeType(node.id, newType); // Update type in store
    }
  };

  const handleNpcChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newNpcId = event.target.value;
    if (node && node.type === 'npc') {
      updateNodeNpcId(node.id, newNpcId || undefined); // Pass undefined if placeholder selected
    }
  };

  const handleJumpTargetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    if (node && node.type === 'jump') {
      if (selectedValue) {
        const [targetNpcId, targetConversationId] = selectedValue.split('|');
        if (targetNpcId && targetConversationId) {
          updateNodeTargetConversation(node.id, targetNpcId, targetConversationId);
        } else {
           console.error("Invalid jump target value selected:", selectedValue);
           updateNodeTargetConversation(node.id, undefined, undefined); // Clear if invalid
        }
      } else {
        // Clear the target if the placeholder is selected
        updateNodeTargetConversation(node.id, undefined, undefined);
      }
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (node && node.type !== 'input' && onNodesChange) {
      const deleteChange: NodeChange = { type: 'remove', id: node.id };
      onNodesChange([deleteChange]);
    }
  }, [node, onNodesChange]);

  // Prepare options for the type dropdown
  const nodeTypeOptions: SelectOption[] = availableNodeTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1) // Capitalize type name
  }));

  // Don't render if no node selected or if it's the non-editable input node
  if (!node || node.type === 'input') {
    return null;
  }

  // Prepare the delete action button for the panel header
  const panelActions = <IconButton icon={<Trash2 size={16} />} label="Delete Node" onClick={handleDeleteNode} variant="danger" />;

  // Determine the current value for the jump target dropdown
  const jumpTargetValue = node.type === 'jump' && node.data.targetNpcId && node.data.targetConversationId
    ? `${node.data.targetNpcId}|${node.data.targetConversationId}`
    : '';

  return (
    <Panel title="Edit Node" width="18rem" actions={panelActions}>
      <div className="space-y-4">
        {/* Node Title Input */}
        <Input
          ref={inputRef}
          label="Node Title"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          placeholder="Enter node title"
          id={`node-label-${node.id}`}
        />

        {/* Node Text Editor (Hidden for jump nodes) */}
        {node.type !== 'jump' && (
            <div className="mb-4">
              <label htmlFor={`node-text-${node.id}`} className={typography.label}>Node Text</label>
              <MarkdownEditor
                id={`node-text-${node.id}`}
                initialValue={text}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                placeholder="Enter text with markdown formatting..."
                rows={5}
              />
            </div>
        )}

        {/* Node Type Selector */}
        <Select
          id={`node-type-${node.id}`}
          label="Node Type"
          value={selectedType}
          onChange={handleTypeChange}
          options={nodeTypeOptions}
        />

        {/* Conditional NPC Selector */}
        {node.type === 'npc' && (
          <Select
            id={`node-npc-${node.id}`}
            label="Associated NPC"
            value={node.data.npcId || ''}
            onChange={handleNpcChange}
            options={npcOptions}
            placeholder="Select NPC..."
          />
        )}

        {/* Conditional Jump Target Selector */}
        {node.type === 'jump' && (
          <Select
            id={`node-jump-target-${node.id}`}
            label="Jump Target Dialogue"
            value={jumpTargetValue}
            onChange={handleJumpTargetChange}
            options={allConversationsForDropdown}
            placeholder="Select Target Dialogue..."
          />
        )}
      </div>
    </Panel>
  );
};

export default NodeInfoPanel;