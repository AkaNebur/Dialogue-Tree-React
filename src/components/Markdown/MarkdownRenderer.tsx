import React from 'react';

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
}

/**
 * Simple Markdown renderer that supports basic formatting
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown, className = '' }) => {
  if (!markdown || markdown.trim() === '') {
    return null;
  }

  // Convert markdown to HTML (simplified version)
  // This handles basic markdown syntax
  const parseMarkdown = (md: string): string => {
    // Handle line breaks
    let html = md.replace(/\n/g, '<br />');

    // Handle bold - **text** or __text__
    html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Handle italic - *text* or _text_
    html = html.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Handle strikethrough - ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

    // Handle headers - # Header, ## Header, etc.
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mb-1">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-md font-bold mb-1">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mb-1">$1</h3>');

    // Handle unordered lists - * item, - item
    // Replace each list item first
    html = html.replace(/^[*-] (.*$)/gm, '<li>$1</li>');
    // Then wrap consecutive <li> elements with <ul>
    html = html.replace(/(<li>.*<\/li>)(?!\n<li>)/g, '<ul class="list-disc ml-5 mb-2">$1</ul>');

    // Handle ordered lists - 1. item
    // Replace each list item first
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    // Then wrap consecutive <li> elements with <ol>
    html = html.replace(/(<li>.*<\/li>)(?!\n<li>)/g, '<ol class="list-decimal ml-5 mb-2">$1</ol>');

    // Handle code blocks - `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm font-mono">$1</code>');

    // Handle blockquotes - > text
    html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-2 py-1 my-1 italic text-gray-600 dark:text-gray-400">$1</blockquote>');

    // Handle horizontal rule - ---, ***, ___
    html = html.replace(/^(\-\-\-|\*\*\*|___)$/gm, '<hr class="border-t border-gray-300 dark:border-gray-700 my-2" />');

    return html;
  };

  // Parse markdown to html
  const htmlContent = parseMarkdown(markdown);

  return (
    <div 
      className={`markdown-content whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;