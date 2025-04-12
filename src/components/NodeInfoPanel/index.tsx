// File: src/components/NodeInfoPanel/index.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { NodeChange } from 'reactflow'; // Import NodeChange type
import { useNodeInfoPanelData } from '../../store/dialogueStore';
import Input from '../ui/Input';
import Panel from '../ui/Panel';
import Select, { SelectOption } from '../ui/Select'; // Import the new Select component
import IconButton from '../ui/IconButton'; // Import IconButton
import { typography } from '../../styles/commonStyles';
import MarkdownEditor from '../Markdown/MarkdownEditor';

const NodeInfoPanel: React.FC = () => {
  const {
    selectedNode: node,
    onNodesChange, // Get the onNodesChange action
    updateNodeData,
    updateNodeText,
    updateNodeType,
    availableNodeTypes // This is an array of strings: ['npc', 'user', 'custom']
  } = useNodeInfoPanelData();

  const [label, setLabel] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const prevNodeId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (node && node.id !== prevNodeId.current) {
      setLabel(node.data.label || '');
      setText(node.data.text || '');
      setSelectedType(node.type || 'custom');
      prevNodeId.current = node.id;
    } else if (!node) {
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

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (node) {
        updateNodeText(node.id, newText);
      }
    }, 50);
  };

  const handleTextBlur = () => {
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
      setLabel(node.data.label || ''); // Reset to original on escape
      inputRef.current?.blur();
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    if (node && newType !== selectedType) {
      setSelectedType(newType);
      updateNodeType(node.id, newType);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (node && node.type !== 'input' && onNodesChange) {
      const deleteChange: NodeChange = { type: 'remove', id: node.id };
      onNodesChange([deleteChange]);
      // The panel will disappear automatically as the node is no longer selected
    }
  }, [node, onNodesChange]);

  const nodeTypeOptions: SelectOption[] = availableNodeTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1) // Capitalize (e.g., 'Npc', 'User')
  }));

  // Do not render the panel if no node is selected or if it's the input node
  if (!node || node.type === 'input') {
    return null;
  }

  // Define the delete button for the panel actions
  const panelActions = <IconButton icon={<Trash2 size={16} />} label="Delete Node" onClick={handleDeleteNode} variant="danger" />;

  return (
    <Panel title="Edit Node" width="18rem" actions={panelActions}> {/* Add actions prop */}
      <div className="space-y-4">
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

        {/* Replace the native select with the new Select component */}
        <Select
          id={`node-type-${node.id}`}
          label="Node Type"
          value={selectedType}
          onChange={handleTypeChange}
          options={nodeTypeOptions}
        />

      </div>
    </Panel>
  );
};

export default NodeInfoPanel;