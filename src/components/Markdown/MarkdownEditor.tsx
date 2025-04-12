// src/components/Markdown/MarkdownEditor.tsx
import React, { useState, useRef, useEffect } from 'react';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  height?: string;
}

/**
 * Simplified Markdown editor without preview toggle
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
  onBlur,
  placeholder = 'Enter text with markdown formatting...',
  className = '',
  rows = 4,
  height = 'auto'
}) => {
  const [value, setValue] = useState(initialValue || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key to insert spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      
      // Insert 2 spaces at cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setValue(newValue);
      onChange(newValue);
      
      // Move cursor position after the inserted spaces
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + 2;
        textareaRef.current.selectionEnd = start + 2;
      }
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = 
      value.substring(0, start) + 
      prefix + 
      selectedText + 
      suffix + 
      value.substring(end);
    
    setValue(newValue);
    onChange(newValue);
    
    // Set the cursor position to after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        if (start === end) {
          // If no text was selected, place cursor between prefix and suffix
          textareaRef.current.selectionStart = start + prefix.length;
          textareaRef.current.selectionEnd = start + prefix.length;
        } else {
          // If text was selected, place cursor after the suffix
          textareaRef.current.selectionStart = end + prefix.length + suffix.length;
          textareaRef.current.selectionEnd = end + prefix.length + suffix.length;
        }
      }
    }, 0);
  };

  const baseInputClasses = "w-full px-3 py-2 text-sm rounded-md border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-dark-accent focus:border-transparent shadow-inner";
  
  return (
    <div className={`markdown-editor ${className}`} style={{ minHeight: height }}>
      <div className="flex space-x-1 mb-1">
        <button 
          type="button" 
          onClick={() => insertFormatting('**')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('*')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('~~')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('`')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Code"
        >
          <code>{'<>'}</code>
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('# ')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Heading"
        >
          H
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('- ')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="List item"
        >
          •
        </button>
        <button 
          type="button" 
          onClick={() => insertFormatting('> ')}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Blockquote"
        >
          "
        </button>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`${baseInputClasses} resize-y`}
      />
    </div>
  );
};

export default MarkdownEditor;