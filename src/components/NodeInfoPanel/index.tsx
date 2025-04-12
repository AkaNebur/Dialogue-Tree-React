// src/components/NodeInfoPanel/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNodeInfoPanelData } from '../../store/dialogueStore';
import MarkdownEditor from '../Markdown/MarkdownEditor.tsx';

// --- Consistent Style Definitions ---
const panelBaseClasses = "w-72 bg-blue-50 dark:bg-dark-surface rounded-xl shadow-lg p-4 border border-blue-100 dark:border-dark-border transition-colors duration-300";
const panelTitleClasses = "text-base font-semibold text-gray-700 dark:text-gray-300 mb-4";

const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
const inputBaseClasses = "w-full px-3 py-2 text-sm rounded-md border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-dark-accent focus:border-transparent shadow-inner";
// --- End Style Definitions ---


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
    
    // Update the node text with a short debounce for better performance
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (node) {
        updateNodeText(node.id, newText);
      }
    }, 50);
  };

  // Still keep the onBlur handler as a backup to ensure changes are saved
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!node || node.type === 'input') {
    return null;
  }

  return (
    <div className={panelBaseClasses}>
      <h3 className={panelTitleClasses}> Edit Node </h3>

      <div className="mb-4">
        <label htmlFor={`node-label-${node.id}`} className={labelBaseClasses}> Node Title </label>
        <input
          ref={inputRef}
          id={`node-label-${node.id}`}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          placeholder="Enter node title"
          className={inputBaseClasses}
        />
      </div>

      <div className="mb-4">
        <label htmlFor={`node-text-${node.id}`} className={labelBaseClasses}> Node Text </label>
        <MarkdownEditor
          initialValue={text}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="Enter text with markdown formatting..."
          rows={5}
        />
      </div>

      <div>
        <label htmlFor={`node-type-${node.id}`} className={labelBaseClasses}> Node Type </label>
        <select
          id={`node-type-${node.id}`}
          value={selectedType}
          onChange={handleTypeChange}
          className={`${inputBaseClasses} appearance-none pr-8 bg-no-repeat bg-right`}
          // Simple SVG arrow for dropdown indicator
          style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>')` }}
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