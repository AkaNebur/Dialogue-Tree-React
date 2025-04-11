// src/components/Toolbar/index.tsx
import React, { useState } from 'react';
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
type ToolType = 'rectangle' | 'diamond' | 'circle' | 'arrow' | 'text' | 'user' | 'npc';

interface ToolbarProps {
  className?: string;
}

/**
 * Toolbar component for the dialogue editor
 * Contains editing tools with visual styling matching the design
 */
const Toolbar: React.FC<ToolbarProps> = ({ className = '' }) => {
  // Get the selected NPC data from the store
  const { selectedNpc } = useSidebarData();
  
  // State to track the currently selected tool
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  
  // Determine if we have a custom NPC image to use
  const hasNpcImage = selectedNpc && selectedNpc.image;
  
  // Handler for tool selection
  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool === selectedTool ? null : tool); // Toggle if already selected
  };
  
  return (
    <div className={`bg-blue-50 dark:bg-dark-surface rounded-xl shadow-lg px-3 py-2 flex items-center space-x-1 border-2 border-blue-100 dark:border-dark-border transition-colors duration-300 ${className}`}>
      <ToolbarButton 
        icon={<Square size={18} />} 
        tooltip="Rectangle Tool" 
        active={selectedTool === 'rectangle'}
        onClick={() => handleToolSelect('rectangle')}
      />
      <ToolbarButton 
        icon={<Diamond size={18} />} 
        tooltip="Diamond Tool" 
        active={selectedTool === 'diamond'}
        onClick={() => handleToolSelect('diamond')}
      />
      <ToolbarButton 
        icon={<Circle size={18} />} 
        tooltip="Circle Tool" 
        active={selectedTool === 'circle'}
        onClick={() => handleToolSelect('circle')}
      />
      <ToolbarDivider />
      <ToolbarButton 
        icon={<ArrowRight size={18} />} 
        tooltip="Arrow Tool" 
        active={selectedTool === 'arrow'}
        onClick={() => handleToolSelect('arrow')}
      />
      <ToolbarDivider />
      <ToolbarButton 
        icon={<Type size={18} />} 
        tooltip="Text Tool" 
        active={selectedTool === 'text'}
        onClick={() => handleToolSelect('text')}
      />
      <ToolbarDivider />
      <ToolbarButton 
        icon={<UserSquare size={18} />} 
        tooltip="Module User" 
        active={selectedTool === 'user'}
        onClick={() => handleToolSelect('user')}
      />
      <ToolbarButton 
        icon={
          hasNpcImage ? (
            <div className="w-5 h-5 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
              <img src={selectedNpc.image} alt={selectedNpc.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
          )
        } 
        tooltip={selectedNpc ? `Module NPC: ${selectedNpc.name}` : "Module NPC"} 
        active={selectedTool === 'npc'}
        onClick={() => handleToolSelect('npc')}
      />
    </div>
  );
};

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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-md transition-colors duration-200 relative group
        ${active 
          ? 'bg-blue-500 dark:bg-indigo-900 text-white' 
          : 'text-gray-600 hover:bg-blue-100 dark:text-gray-200 dark:hover:bg-gray-700'
        }`}
      title={tooltip}
    >
      {icon}
      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {tooltip}
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