import React, { useState, useRef, useEffect } from "react";

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  height?: string;
  id?: string; // Added id prop for accessibility
}

/**
 * Markdown editor with smarter, toggle‑aware formatting buttons.
 * - Clicking a formatting button now **toggles** the markup around the current
 *   selection instead of always inserting more characters.
 * - For block‑level prefixes ("# ", "- ", "> "), the markup is added/removed
 *   at the beginning of the current line.
 * - If no text is selected, the editor places the caret between the new
 *   prefix/suffix to encourage typing instead of leaving doubled markup.
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue,
  onChange,
  onBlur,
  placeholder = "Enter text with markdown formatting...",
  className = "",
  rows = 4,
  height = "auto",
  id,
}) => {
  const [value, setValue] = useState(initialValue || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ------------------------------------------------------------------ */
  /* Utilities                                                          */
  /* ------------------------------------------------------------------ */
  /** True when the substring [start,end) in `value` is wrapped with
   *  prefix+suffix. */
  const hasWrap = (
    start: number,
    end: number,
    prefix: string,
    suffix: string
  ): boolean => {
    return (
      start >= prefix.length &&
      value.substring(start - prefix.length, start) === prefix &&
      value.substring(end, end + suffix.length) === suffix
    );
  };

  /** Return the index of the first character in `value` on the current line
   *  of `caret`. */
  const currentLineStart = (caret: number): number => {
    const nlPos = value.lastIndexOf("\n", caret - 1);
    return nlPos === -1 ? 0 : nlPos + 1;
  };

  const updateValue = (newValue: string, selStart: number, selEnd: number) => {
    setValue(newValue);
    onChange(newValue);
    // restore selection after DOM update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = selStart;
        textareaRef.current.selectionEnd = selEnd;
      }
    }, 0);
  };

  /* ------------------------------------------------------------------ */
  /* Formatting shortcut handlers                                        */
  /* ------------------------------------------------------------------ */
  const toggleInline = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = value.substring(start, end);

    if (hasWrap(start, end, prefix, suffix)) {
      // Remove existing wrapper
      const newValue =
        value.substring(0, start - prefix.length) +
        selection +
        value.substring(end + suffix.length);
      updateValue(newValue, start - prefix.length, end - prefix.length);
    } else {
      // Add wrapper
      const newValue =
        value.substring(0, start) +
        prefix +
        selection +
        suffix +
        value.substring(end);
      const cursor = selection ? end + prefix.length + suffix.length : start + prefix.length;
      updateValue(newValue, cursor, cursor);
    }
  };

  const toggleBlock = (blockPrefix: string) => {
    if (!textareaRef.current) return;

    const caret = textareaRef.current.selectionStart;
    const lineStart = currentLineStart(caret);

    if (value.startsWith(blockPrefix, lineStart)) {
      // Remove block prefix
      const newValue =
        value.substring(0, lineStart) +
        value.substring(lineStart + blockPrefix.length);
      updateValue(newValue, caret - blockPrefix.length, caret - blockPrefix.length);
    } else {
      // Insert block prefix
      const newValue =
        value.substring(0, lineStart) +
        blockPrefix +
        value.substring(lineStart);
      updateValue(newValue, caret + blockPrefix.length, caret + blockPrefix.length);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Event handlers                                                      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Insert 2 spaces on Tab instead of changing focus
    if (e.key === "Tab") {
      e.preventDefault();
      if (!textareaRef.current) return;
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      updateValue(newValue, start + 2, start + 2);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */
  const baseInputClasses =
    "w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent shadow-inner";

  return (
    <div className={`markdown-editor ${className}`} style={{ minHeight: height }}>
      {/* Toolbar */}
      <div className="flex space-x-1 mb-1">
        <ToolbarButton label="Bold" onClick={() => toggleInline("**")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => toggleInline("*")}> 
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Strikethrough" onClick={() => toggleInline("~~")}> 
          <s>S</s>
        </ToolbarButton>
        <ToolbarButton label="Code" onClick={() => toggleInline("`")}> 
          <code>{"<>"}</code>
        </ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => toggleBlock("# ")}>H</ToolbarButton>
        <ToolbarButton label="List item" onClick={() => toggleBlock("- ")}>•</ToolbarButton>
        <ToolbarButton label="Blockquote" onClick={() => toggleBlock("> ")}>"</ToolbarButton>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
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

/* -------------------------------------------------------------------- */
/* Helper components                                                     */
/* -------------------------------------------------------------------- */
interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700"
    title={label}
  >
    {children}
  </button>
);

export default MarkdownEditor;
