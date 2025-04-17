// File: src/components/Toolbar/index.tsx
// *** MODIFIED ***
import React from 'react';
import {
  User,
  UserSquare,
  Repeat,
  Move, // Keep Move icon for drag handle indication
  ArrowRightCircle // Import icon for Jump Node
} from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import IconButton from '../ui/IconButton';
import { tooltipStyles } from '../../styles/commonStyles';

// Tool type enum for tracking selected tool
export type ToolType = 'user' | 'npc' | 'auto'; // Keep as is, drag doesn't need a 'tool' state

// Node type to be created via drag-and-drop
export type DraggableNodeType = 'user' | 'npc' | 'jump'; // Added 'jump'

interface ToolbarProps {
  className?: string;
  activeTool: ToolType | null; // Currently active tool (for click-based interactions)
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

  // Handler for tool selection (click) - Only for non-draggable tools
  const handleToolSelect = (tool: ToolType) => {
    // If clicking the already active tool, deactivate it (set to null)
    // Otherwise, activate the clicked tool
    onToolChange(tool === activeTool ? null : tool);
  };

  // Handler for starting drag operation
  const onDragStart = (event: React.DragEvent<HTMLButtonElement>, nodeType: DraggableNodeType) => {
    // Set the data type and the node type being dragged
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    console.log(`[Toolbar] Drag Start: ${nodeType}`);
    // Optionally clear active tool when dragging starts?
    // onToolChange(null);
  };

  return (
    <div className={`bg-[var(--color-surface)] rounded-xl shadow-lg p-2 flex items-center space-x-1 border-2 border-[var(--color-border)] transition-colors duration-300 ${className}`}>

      {/* Draggable User Node Button */}
      <ToolbarButton
        icon={<UserSquare size={18} />}
        label="User Node (Drag to Create)"
        draggable={true} // Make this button draggable
        onDragStart={(event) => onDragStart(event, 'user')} // Pass the node type
      />

      {/* Draggable NPC Node Button */}
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
        label={selectedNpc ? `NPC Node: ${selectedNpc.name} (Drag to Create)` : "NPC Node (Drag to Create)"}
        draggable={true} // Make this button draggable
        onDragStart={(event) => onDragStart(event, 'npc')} // Pass the node type
      />

      {/* Draggable Jump Node Button */}
      <ToolbarButton
        icon={<ArrowRightCircle size={18} />}
        label="Jump Node (Drag to Create)"
        draggable={true}
        onDragStart={(event) => onDragStart(event, 'jump')}
      />

      {/* Separator */}
       <div className="h-6 w-px bg-gray-700 mx-1"></div>

      {/* Non-Draggable Auto Alternate Mode Button */}
      <ToolbarButton
        icon={<Repeat size={18} />}
        label="Auto Alternate Mode (Click Only)"
        active={activeTool === 'auto'}
        onClick={() => handleToolSelect('auto')}
        draggable={false} // Explicitly non-draggable
      />

    </div>
  );
};

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean; // Only relevant for click-based tools
  draggable?: boolean; // Added draggable prop
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>) => void; // Added drag start handler
}

// Update ToolbarButtonProps to accept draggable and onDragStart
const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
  draggable = false, // Default to not draggable
  onDragStart,
  ...props
}) => {
  return (
    <div className={`${tooltipStyles.wrapper} group relative`}>
      {/* Use IconButton and pass draggable/onDragStart */}
      <IconButton
        icon={icon}
        label={label} // Used for title/aria-label internally
        onClick={onClick}
        variant="original"
        className={
            // Apply active style only if it's a click-based tool and active
            !draggable && active
                ? 'bg-gray-900 ring-1 ring-gray-600 cursor-pointer'
                // Apply drag cursor styles if draggable
                : draggable
                    ? 'cursor-grab active:cursor-grabbing'
                    // Default pointer for click-based tools
                    : 'cursor-pointer'
        }
        draggable={draggable} // Pass draggable to underlying button
        onDragStart={draggable ? onDragStart : undefined} // Pass onDragStart only if draggable
        disabled={props.disabled || active} // Disable click if already active (for toggle tools)
        {...props}
      />
      {/* Optional: Visual drag indicator */}
      {draggable && (
          <Move size={10} className="absolute -top-1 -right-1 text-gray-500 opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none" />
      )}
      {/* Tooltip remains the same */}
      <span className={`${tooltipStyles.tooltip} ${tooltipStyles.position.bottom} opacity-0 group-hover:opacity-100`}>
        {label}
        <div className={`${tooltipStyles.arrow} top-0 left-1/2 transform -translate-x-1/2 -mt-1`}></div>
      </span>
    </div>
  );
};

export default Toolbar;