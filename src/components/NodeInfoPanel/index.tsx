// File: src/components/NodeInfoPanel/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNodeInfoPanelData } from '../../store/dialogueStore';

const NodeInfoPanel: React.FC = () => {
  const {
    selectedNode: node,
    updateNodeData,
    updateNodeText,
    updateNodeType,
    availableNodeTypes
  } = useNodeInfoPanelData();

  const [label, setLabel] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const prevNodeId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (node && node.id !== prevNodeId.current) {
      setLabel(node.data.label || '');
      setText(node.data.text || '');
      setSelectedType(node.type || 'custom');
      prevNodeId.current = node.id;
      inputRef.current?.focus();
      inputRef.current?.select();
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
      setLabel(node.data.label || '');
      inputRef.current?.blur();
    }
  };

  const handleTextKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!node) return;
    if (event.key === 'Escape') {
      setText(node.data.text || '');
      textareaRef.current?.blur();
    }
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = event.target.value;
    if (node && newType !== selectedType) {
      setSelectedType(newType);
      updateNodeType(node.id, newType);
    }
  };

  if (!node || node.type === 'input') {
    return null;
  }

  return (
    <div className="w-72 bg-blue-50 dark:bg-dark-surface rounded-xl shadow-lg p-3 border border-blue-100 dark:border-dark-border transition-colors duration-300">
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 px-1">
        Edit Node
      </h3>

      {/* Label Input Section */}
      <div className="mb-3">
        <label
          htmlFor={`node-label-${node.id}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 px-1"
        >
          Node Title
        </label>
        <input
          ref={inputRef}
          id={`node-label-${node.id}`}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          placeholder="Enter node title"
          className="w-full p-2 border border-blue-200 dark:border-dark-border rounded-md text-sm
                     focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-dark-accent
                     shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text"
        />
      </div>

      {/* Text Area Section */}
      <div className="mb-3">
        <label
          htmlFor={`node-text-${node.id}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 px-1"
        >
          Node Text
        </label>
        <textarea
          ref={textareaRef}
          id={`node-text-${node.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleTextBlur}
          onKeyDown={handleTextKeyDown}
          placeholder="Enter detailed node text or dialogue..."
          rows={4}
          className="w-full p-2 border border-blue-200 dark:border-dark-border rounded-md text-sm
                     focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-dark-accent
                     shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text resize-y"
        />
      </div>

      {/* Node Type Dropdown Section */}
      <div>
        <label
          htmlFor={`node-type-${node.id}`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 px-1"
        >
          Node Type
        </label>
        <select
          id={`node-type-${node.id}`}
          value={selectedType}
          onChange={handleTypeChange}
          className="w-full p-2 border border-blue-200 dark:border-dark-border rounded-md text-sm
                     focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-dark-accent
                     shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text appearance-none"
        >
          {availableNodeTypes.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NodeInfoPanel;