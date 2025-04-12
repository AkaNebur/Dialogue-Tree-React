// File: src/components/DialogueFlow/CharacterNodeBase.tsx

import React, { CSSProperties } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { User } from 'lucide-react';
import { DialogueNodeData } from '../../types';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';
import { hexToRgba } from '../../utils/colorUtils'; // Removed isColorLight import as it's no longer needed for text
import { colors, typography } from '../../styles/commonStyles'; // Import common styles

// Extended CSS Properties to include CSS variables
interface ExtendedCSSProperties extends CSSProperties {
  [key: `--${string}`]: string | number;
}

// --- Text Contrast Colors (from theme/variables) ---
const CONTRAST_TEXT_LIGHT_CLASS = 'text-white'; // Use white text for dark backgrounds
// CONTRAST_TEXT_DARK_CLASS removed as it's no longer needed

// --- Node Base Classes from commonStyles/Tailwind ---
const nodeContainerBaseClasses = `
  shadow-md rounded-lg bg-[var(--color-surface)] border-2 w-[250px]
  flex flex-col overflow-hidden transition-all duration-200
`;
const nodeHeaderClasses = `
  flex items-center p-2 border-b
`;
const nodeBodyClasses = `
  p-3 text-sm ${colors.text.secondary} break-words
`;
const nodePlaceholderClasses = `
  text-xs italic ${colors.text.placeholder}
`;
const nodeIconContainerClasses = `
  flex-shrink-0 rounded-full w-8 h-8 flex justify-center items-center
  mr-2 overflow-hidden border border-gray-500 bg-gray-600
`;
const nodeTitleLabelClasses = `
  ${typography.body.sm} font-semibold tracking-wide truncate
`;
const nodeTitleNameClasses = `
  ${typography.body.md} font-semibold truncate
`;

interface CharacterNodeBaseProps extends NodeProps<DialogueNodeData> {
  nodeType: 'user' | 'npc';
  characterName?: string;
  characterImage?: string;
  accentColor?: string;
}

const CharacterNodeBase: React.FC<CharacterNodeBaseProps> = ({
  data,
  isConnectable,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  nodeType,
  characterName,
  characterImage,
  accentColor,
  // selected, // React Flow adds .selected class to the wrapper automatically
}) => {
  const isUser = nodeType === 'user';

  // Default to gray background and white text unless overridden by NPC accent
  let headerBgClass = colors.accent.gray.primary;
  let borderClass = colors.border.light;
  let headerTextColorClass = CONTRAST_TEXT_LIGHT_CLASS;
  // isHeaderBgLight variable removed

  const dynamicInlineStyles: ExtendedCSSProperties = {};

  if (isUser) {
    headerBgClass = 'bg-gray-700';
    borderClass = 'border-gray-600';
  } else if (accentColor) {
    // Text color logic based on background lightness removed.
    // CSS variable will handle text color via index.css.
    dynamicInlineStyles.backgroundColor = hexToRgba(accentColor, 0.1); // Semi-transparent bg for card
    dynamicInlineStyles.borderColor = accentColor;
    dynamicInlineStyles['--npc-accent-color'] = accentColor;
    // FORCE WHITE TEXT: Set the CSS variable used by index.css to always be white
    dynamicInlineStyles['--npc-contrast-color'] = '#fff';
    headerBgClass = '';
    borderClass = ''; // Clear Tailwind border class when using inline style
  } else {
    // Default NPC style (if no accent color)
    headerBgClass = 'bg-gray-700';
    borderClass = 'border-gray-600';
    headerTextColorClass = CONTRAST_TEXT_LIGHT_CLASS;
  }

  // --- Class Construction ---
  // Combine base classes with conditional type and border classes
  const finalContainerClasses = [
    nodeContainerBaseClasses,
    'character-node', // Ensure this class is present for CSS targeting
    `${nodeType}-node`, // Keep specific type class if needed elsewhere
    borderClass,        // Apply Tailwind border class if no accent color
  ].filter(Boolean).join(' ');

  const finalHeaderClasses = [
    nodeHeaderClasses,
    headerBgClass,
    'character-node-header', // Add class for targeting in CSS
  ].filter(Boolean).join(' ');

  const titleLabelText = isUser ? 'User Dialogue' : (characterName || 'NPC');
  const defaultNodeName = isUser ? 'User Response' : 'NPC Response';

  const renderIcon = () => (
    <div className={nodeIconContainerClasses}>
      {isUser ? (
         <User size={16} className="text-gray-300" />
      ) : characterImage ? (
         <img
           src={characterImage}
           alt={characterName || 'NPC'}
           className="w-full h-full object-cover"
         />
      ) : (
         <User size={16} className="text-gray-400" />
      )}
    </div>
  );

  return (
    <div
      className={finalContainerClasses}
      // Apply inline styles primarily for the accent color border/background
      style={borderClass ? {} : dynamicInlineStyles} // Apply inline border/bg only if accent color exists
      data-has-accent-color={!isUser && accentColor ? "true" : "false"}
      // data-accent-is-light is no longer needed for text color logic here
      // data-selected attribute is not needed; rely on .selected class from React Flow wrapper
    >
      {/* Header - Apply dynamic classes and potentially inline background for accent */}
      {/* Apply header background/border styles via inline style ONLY when accentColor is present */}
      <div
        className={finalHeaderClasses}
        style={accentColor ? {
          backgroundColor: hexToRgba(accentColor, 0.2), // Use 20% opacity like the card
          borderColor: accentColor  // Keep border solid color for better definition
        } : {}}>
        {renderIcon()}
        <div className="flex-grow min-w-0">
          <div className={`${nodeTitleLabelClasses} ${headerTextColorClass}`}>
            {/* headerTextColorClass is now always white, but the CSS variable --npc-contrast-color
                set above and used in index.css will take precedence due to !important */}
            {titleLabelText}
          </div>
          <div className={`${nodeTitleNameClasses} ${headerTextColorClass}`}>
            {data.label || defaultNodeName}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className={nodeBodyClasses}>
        {data.text ? (
          <MarkdownRenderer markdown={data.text} />
        ) : (
          <div className={nodePlaceholderClasses}>No text entered.</div>
        )}
      </div>

      {/* Handles - Rely on global CSS styles in index.css */}
      <Handle
        type="target"
        position={targetPosition}
        isConnectable={isConnectable}
        className="!transition-colors !duration-150"
        id="target"
      />
      <Handle
        type="source"
        position={sourcePosition}
        isConnectable={isConnectable}
        className="!transition-colors !duration-150"
        id="source"
      />
    </div>
  );
};

export default React.memo(CharacterNodeBase);