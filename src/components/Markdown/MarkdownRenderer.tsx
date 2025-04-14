// File: src/components/Markdown/MarkdownRenderer.tsx
// *** MODIFIED ***

import React from 'react';
import ReactMarkdown from 'react-markdown'; // <-- Import the library
import remarkGfm from 'remark-gfm';         // <-- Import the GFM plugin

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

/**
 * Renders markdown content using the react-markdown library.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className = '' }) => {
  if (!markdown || markdown.trim() === '') {
    return null;
  }

  // Use ReactMarkdown component instead of custom parser + dangerouslySetInnerHTML
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Enable GitHub Flavored Markdown
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;