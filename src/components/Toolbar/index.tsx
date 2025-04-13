// File: src/components/Toolbar/index.tsx

// src/components/Toolbar/index.tsx - Updated with auto alternating mode
import React from 'react';
import {
  User,
  UserSquare,
  Repeat
} from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import IconButton from '../ui/IconButton';
import { tooltipStyles } from '../../styles/commonStyles';

// Tool type enum for tracking selected tool (Added 'auto' for alternating mode)
export type ToolType = 'user' | 'npc' | 'auto';

interface ToolbarProps {
  className?: string;
  activeTool: ToolType | null; // Currently active tool
  onToolChange: (tool: ToolType | null) => void; // Callback for tool change
}

/**
 * Toolbar component for the dialogue editor
 * Contains editing tools with visual styling matching the design
 */
const Toolbar: React.FC<ToolbarProps> = ({
  className = '',
  activeTool,
  onToolChange,
}) => {
  // Get the selected NPC data from the store
  const { selectedNpc } = useSidebarData();

  // Determine if we have a custom NPC image to use
  const hasNpcImage = selectedNpc && selectedNpc.image;

  // Handler for tool selection
  const handleToolSelect = (tool: ToolType) => {
    // If clicking the already active tool, deactivate it (set to null)
    // Otherwise, activate the clicked tool
    onToolChange(tool === activeTool ? null : tool);
  };

  return (
    // Adjusted padding to p-2 to match header buttons height
    <div className={`bg-[var(--color-surface)] rounded-xl shadow-lg p-2 flex items-center space-x-1 border-2 border-[var(--color-border)] transition-colors duration-300 ${className}`}>
      {/* Node Creation Tools */}
      <ToolbarButton
        icon={<UserSquare size={18} />}
        label="User Node"
        active={activeTool === 'user'}
        onClick={() => handleToolSelect('user')}
      />
      <ToolbarButton
        icon={
          hasNpcImage ? (
            <div className="w-5 h-5 rounded-md overflow-hidden border border-gray-600">
              <img src={selectedNpc?.image} alt={selectedNpc?.name || 'NPC'} className="w-full h-full object-cover" />
            </div>
          ) : (
             <div className="w-5 h-5 rounded-md bg-gray-700 flex items-center justify-center border border-gray-600">
               <User size={14} className="text-gray-400" />
             </div>
          )
        }
        label={selectedNpc ? `NPC Node: ${selectedNpc.name}` : "NPC Node"}
        active={activeTool === 'npc'}
        onClick={() => handleToolSelect('npc')}
      />
      
      {/* New Auto Alternate Mode Button */}
      <ToolbarButton
        icon={<Repeat size={18} />}
        label="Auto Alternate Mode"
        active={activeTool === 'auto'}
        onClick={() => handleToolSelect('auto')}
      />
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active = false
}) => {
  return (
    <div className={tooltipStyles.wrapper}>
      {/* Use variant="original" to match header buttons */}
      <IconButton
        icon={icon}
        label={label}
        onClick={onClick}
        // Use "original" variant for base style matching header buttons
        variant="original"
        // Apply active state styling conditionally, similar to layout buttons in App.tsx
        // Adds a subtle background change and a ring to indicate selection
        className={
          active
            ? 'bg-gray-900 ring-1 ring-gray-600' // Active state: darker bg + ring
            : '' // Default state uses the "original" variant styles
        }
      />
      <span className={`${tooltipStyles.tooltip} ${tooltipStyles.position.bottom} opacity-0 group-hover:opacity-100`}>
        {label}
        <div className={`${tooltipStyles.arrow} top-0 left-1/2 transform -translate-x-1/2 -mt-1`}></div>
      </span>
    </div>
  );
};

export default Toolbar;