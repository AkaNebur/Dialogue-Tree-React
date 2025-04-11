// src/components/Toolbar/index.tsx
import React from 'react'; // Removed useState as active state comes from props now
import {
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Type,
  User,
  UserSquare
} from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';

// Tool type enum for tracking selected tool
export type ToolType = 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'text' | 'user' | 'npc';

interface ToolbarProps {
  className?: string;
  activeTool: ToolType | null; // <<< New prop: Currently active tool
  onToolChange: (tool: ToolType | null) => void; // <<< New prop: Callback for tool change
}

/**
 * Toolbar component for the dialogue editor
 * Contains editing tools with visual styling matching the design
 */
const Toolbar: React.FC<ToolbarProps> = ({
  className = '',
  activeTool,   // <<< Destructure new prop
  onToolChange, // <<< Destructure new prop
}) => {
  // Get the selected NPC data from the store
  const { selectedNpc } = useSidebarData();

  // State to track the currently selected tool is REMOVED - Controlled by App now

  // Determine if we have a custom NPC image to use
  const hasNpcImage = selectedNpc && selectedNpc.image;

  // Handler for tool selection - now calls the prop
  const handleToolSelect = (tool: ToolType) => {
    // If clicking the already active tool, deactivate it (set to null)
    // Otherwise, activate the clicked tool
    onToolChange(tool === activeTool ? null : tool);
  };

  return (
    <div className={`bg-blue-50 dark:bg-dark-surface rounded-xl shadow-lg px-3 py-2 flex items-center space-x-1 border-2 border-blue-100 dark:border-dark-border transition-colors duration-300 ${className}`}>
      {/* Geometric Shape Tools */}
      <ToolbarButton
        icon={<Square size={18} />}
        tooltip="Rectangle Tool"
        active={activeTool === 'rectangle'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('rectangle')}
      />
      <ToolbarButton
        icon={<Diamond size={18} />}
        tooltip="Diamond Tool"
        active={activeTool === 'diamond'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('diamond')}
      />
      <ToolbarButton
        icon={<Circle size={18} />}
        tooltip="Circle Tool"
        active={activeTool === 'circle'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('circle')}
      />
      <ToolbarDivider />
      {/* Connection and Text Tools */}
      <ToolbarButton
        icon={<ArrowRight size={18} />}
        tooltip="Arrow Tool"
        active={activeTool === 'arrow'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('arrow')}
      />
      <ToolbarDivider />
      <ToolbarButton
        icon={<Type size={18} />}
        tooltip="Text Tool"
        active={activeTool === 'text'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('text')}
      />
      <ToolbarDivider />
      {/* Node Creation Tools */}
      <ToolbarButton
        icon={<UserSquare size={18} />}
        tooltip="Node User"
        active={activeTool === 'user'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('user')}
      />
      <ToolbarButton
        icon={
          hasNpcImage ? (
            <div className="w-5 h-5 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
              <img src={selectedNpc?.image} alt={selectedNpc?.name || 'NPC'} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
          )
        }
        tooltip={selectedNpc ? `Node NPC: ${selectedNpc.name}` : "Node NPC"}
        active={activeTool === 'npc'} // <<< Use activeTool prop
        onClick={() => handleToolSelect('npc')}
      />
    </div>
  );
};

// ToolbarButton and ToolbarDivider remain the same as your previous version
interface ToolbarButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  tooltip,
  onClick,
  active = false
}) => {
  // Keep the tooltip span for hover effect, but the primary tooltip is handled by the title attribute
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors duration-200 relative group
        ${active
          ? 'bg-blue-500 dark:bg-indigo-900 text-white'
          : 'text-gray-600 hover:bg-blue-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
      title={tooltip} // Browser native tooltip for accessibility and fallback
    >
      {icon}
      {/* Enhanced visual tooltip on hover */}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-black rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {tooltip}
         {/* Optional: Add a small arrow/triangle to the tooltip */}
         <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-black rotate-45 -mt-1"></div>
      </span>
    </button>
  );
};

const ToolbarDivider: React.FC = () => {
  return (
    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
  );
};


export default Toolbar;