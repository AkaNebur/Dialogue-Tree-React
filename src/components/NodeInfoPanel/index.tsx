// src/components/NodeInfoPanel/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DialogueNode } from '../../types';
import { X, Save, Info } from 'lucide-react';
import { debounce } from 'lodash';

interface NodeInfoPanelProps {
  node: DialogueNode | null; // Accept null when no single node is selected
  onUpdateLabel: (nodeId: string, newLabel: string) => void;
  onClose?: () => void; // Optional close handler if needed externally
}

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = ({ node, onUpdateLabel, onClose }) => {
  const [label, setLabel] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((id: string, newLabel: string) => {
      if (id && newLabel.trim()) {
        onUpdateLabel(id, newLabel.trim());
        console.log(`[NodeInfoPanel] Saved label for node ${id}`);
      }
    }, 750), // Save after 750ms of inactivity
    [onUpdateLabel]
  );

  // Update local state when the selected node changes
  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
      setIsEditing(false); // Reset editing state when node changes
    } else {
      setLabel(''); // Clear label if no node is selected
      setIsEditing(false);
    }
    // Cleanup debounce on unmount or node change
    return () => {
      debouncedSave.cancel();
    };
  }, [node, debouncedSave]);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    setIsEditing(true);
    if (node) {
      // Trigger debounced save on change
      debouncedSave(node.id, newLabel);
    }
  };

  const handleForceSave = () => {
    if (node && label.trim()) {
      debouncedSave.cancel(); // Cancel any pending debounce
      onUpdateLabel(node.id, label.trim());
      setIsEditing(false); // Indicate save completed
      console.log(`[NodeInfoPanel] Force saved label for node ${node.id}`);
    }
  };

  // Handle blur: force save immediately
   const handleBlur = () => {
     if (isEditing && node && label !== node.data.label) {
       handleForceSave();
     }
     setIsEditing(false); // Reset editing state on blur regardless
   };

  if (!node) {
    // Optionally render a placeholder when no node is selected
    return (
        <div className="w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-lg border-2 border-blue-100 dark:border-dark-border transition-colors duration-300 p-4 flex flex-col items-center justify-center h-48 opacity-80">
            <Info size={32} className="text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Select a single node<br/>to see its details.</p>
        </div>
    );
  }

  const isStartNode = node.type === 'input';

  return (
    <div className="w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-lg border-2 border-blue-100 dark:border-dark-border transition-colors duration-300 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg rounded-t-2xl">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate pr-2">
          Node: {node.id} {isStartNode ? '(Start)' : ''}
        </h3>
        {onClose && ( // Render close button only if handler is provided
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full"
             title="Close Panel"
           >
             <X size={18} />
           </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 flex-grow">
        {/* Node ID (Read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Node ID
          </label>
          <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-dark-bg rounded px-2 py-1 font-mono text-xs">
            {node.id}
          </p>
        </div>

        {/* Label Editor */}
        <div>
          <label htmlFor={`node-label-${node.id}`} className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Label
          </label>
          <input
            type="text"
            id={`node-label-${node.id}`}
            value={label}
            onChange={handleLabelChange}
            onBlur={handleBlur} // Save on blur
            disabled={isStartNode} // Disable editing for start node label
            className={`w-full px-3 py-2 text-gray-700 dark:text-gray-200 border rounded-md
                        border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-input
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${isStartNode ? 'opacity-70 cursor-not-allowed' : ''}`}
            placeholder="Enter node label"
          />
           {isStartNode && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                    Start node label is derived from the conversation name.
                </p>
            )}
        </div>

        {/* Add more fields here later if needed, e.g., className, custom data */}
        {/*
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Style Class (Optional)
          </label>
          <input type="text" value={node.data.className || ''} className="w-full ... " placeholder="e.g., node-custom" />
        </div>
        */}
      </div>

      {/* Footer (Optional: Could show save status or add explicit save button) */}
      {/*
      <div className="p-2 border-t border-gray-200 dark:border-dark-border text-right">
          {isEditing && node && !isStartNode && (
              <button
                  onClick={handleForceSave}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors flex items-center gap-1 ml-auto"
              >
                  <Save size={14} /> Save Now
              </button>
          )}
      </div>
      */}
    </div>
  );
};

export default NodeInfoPanel;