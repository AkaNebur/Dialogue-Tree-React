// src/components/CardSidebar/index.tsx
import React, { useState, ReactNode, CSSProperties } from 'react';
import { Plus, Settings, User, Info, Map, Edit, Database, X } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import { NPC, Conversation } from '../../types'; // Import specific types
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';
import { utilStyles, cardItemStyles } from '../../styles/commonStyles';
import { hexToRgba } from '../../utils/colorUtils';

// Dnd Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent, // Import DragStartEvent
  DragOverlay,   // Import DragOverlay
  TouchSensor,   // Added TouchSensor for better mobile/touch handling
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers'; // Added modifiers

interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  headerButtons?: ReactNode; // Optional additional header buttons
  betweenHeaderAndContent?: ReactNode; // Optional content to render between header and panels
}

// --- Sortable NPC Item Component ---
interface SortableNpcItemProps {
  npc: NPC;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string, name: string, image?: string, accentColor?: string) => void;
  isDragging?: boolean; // Provided by parent to know if ANY drag is active
  isOverlay?: boolean; // Flag to indicate if it's rendered in the overlay
}
const SortableNpcItem: React.FC<SortableNpcItemProps> = ({
  npc,
  isSelected,
  onSelect,
  onEdit,
  isDragging: isCurrentlyDragging, // Renamed prop to avoid conflict
  isOverlay = false, // Default to false
}) => {
  const {
    attributes,
    listeners, // These listeners will be attached to the selection button
    setNodeRef, // This ref goes on the main container div
    transform,
    transition,
    isDragging: hookIsDragging, // This hook value indicates if THIS instance is the source being dragged
  } = useSortable({ id: npc.id });

  // Determine if the item should visually appear lifted/dragging
  const showLiftedStyle = isCurrentlyDragging || (isOverlay && hookIsDragging);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? 'none' : transition, // No transition for overlay item itself
    // Make the original item invisible when it's being dragged
    opacity: hookIsDragging && !isOverlay ? 0 : 1,
    zIndex: showLiftedStyle ? 10 : 'auto',
    position: 'relative',
    // Apply lifted styles when dragging or when this item is the overlay content
    boxShadow: showLiftedStyle ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none',
    transform: showLiftedStyle
      ? `${CSS.Transform.toString(transform)} scale(1.03)` // Combine transforms
      : CSS.Transform.toString(transform),
    cursor: showLiftedStyle ? 'grabbing' : 'default', // Show grabbing cursor when lifted
  };

  const accentColor = npc.accentColor;
  const useAccentStyle = isSelected && accentColor;

  const itemStyles: React.CSSProperties = {};
  itemStyles.borderWidth = '1px';
  itemStyles.borderStyle = 'solid';

  let bgClasses = '';

  // Base selection/hover styles
  if (isSelected) {
    if (useAccentStyle) {
      itemStyles.borderColor = accentColor;
      itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
    } else {
      itemStyles.borderColor = '#6B7280'; // gray-500
      bgClasses = "bg-gray-900/70";
    }
  } else {
    itemStyles.borderColor = '#757980'; // Custom gray
    bgClasses = 'hover:border-gray-500';
  }

  // Ensure overlay item keeps its correct background/border when selected or default
  if (isOverlay) {
      if (isSelected) {
           if (useAccentStyle) {
               itemStyles.borderColor = accentColor;
               itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
           } else {
               itemStyles.borderColor = '#6B7280';
               itemStyles.backgroundColor = '#1f2937cc'; // Approx bg-gray-800/80 or 900/70
           }
      } else {
          // Default appearance for overlay item
          itemStyles.borderColor = '#757980';
          itemStyles.backgroundColor = '#111827'; // bg-gray-900 (or adjust if your base is different)
      }
  }


  const baseClasses = cardItemStyles.base;

  return (
    // Set the ref and apply ARIA attributes to the main container
    // Don't apply listeners/attributes if it's the overlay clone
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} npc-list-item group`}
      {...(isOverlay ? {} : attributes)} // Apply ARIA attributes only to original
    >
      {/* Selection Button - Apply LISTENERS here (only to original item) */}
      <button
        onClick={() => !isOverlay && onSelect(npc.id)} // Prevent action in overlay
        {...(isOverlay ? {} : listeners)} // Attach drag listeners only to original
        className={`${cardItemStyles.text} pl-16 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }} // Recommended for PointerSensor
        title={isOverlay ? npc.name : (npc.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay} // Disable button actions in overlay
      >
        {npc.name}
      </button>

      {/* Avatar */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-gray-700 flex items-center justify-center pointer-events-none"> {/* pointer-events-none is good */}
        {npc.image ? (
          <img src={npc.image} alt={npc.name} className="w-full h-full object-cover relative z-10" />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <User size={20} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Action Buttons - Hide in overlay */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={(e) => {
            if (!isOverlay) { // Prevent action in overlay
                e.stopPropagation(); // Prevent triggering select/drag
                onEdit(npc.id, npc.name, npc.image, npc.accentColor);
            }
          }}
          title="Edit NPC"
          disabled={isOverlay} // Disable button in overlay
        >
          <Edit size={16} />
        </button>
      </div>
    </div>
  );
};


// --- Sortable Dialogue Item Component ---
interface SortableDialogueItemProps {
  conv: Conversation;
  isSelected: boolean;
  npcAccentColor?: string;
  onSelect: (id: string) => void;
  onEdit: (id: string, name: string) => void; // Corrected type
  isDragging?: boolean; // Provided by parent
  isOverlay?: boolean; // Flag for overlay rendering
}
const SortableDialogueItem: React.FC<SortableDialogueItemProps> = ({
    conv,
    isSelected,
    npcAccentColor,
    onSelect,
    onEdit, // Use the passed handler
    isDragging: isCurrentlyDragging,
    isOverlay = false,
 }) => {
  const {
    attributes,
    listeners, // Attach to selection button
    setNodeRef, // Attach to container div
    transform,
    transition,
    isDragging: hookIsDragging, // This instance is being dragged
  } = useSortable({ id: conv.id });

  const showLiftedStyle = isCurrentlyDragging || (isOverlay && hookIsDragging);

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? 'none' : transition,
    // Make the original item invisible when it's being dragged
    opacity: hookIsDragging && !isOverlay ? 0 : 1,
    zIndex: showLiftedStyle ? 10 : 'auto',
    position: 'relative',
    boxShadow: showLiftedStyle ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none',
    transform: showLiftedStyle
      ? `${CSS.Transform.toString(transform)} scale(1.03)`
      : CSS.Transform.toString(transform),
    cursor: showLiftedStyle ? 'grabbing' : 'default',
  };

  const useAccentStyle = isSelected && npcAccentColor;

  const itemStyles: React.CSSProperties = {};
  itemStyles.borderWidth = '1px'; // Consistent border width
  itemStyles.borderStyle = 'solid';

  let bgClasses = '';

  // Base selection/hover styles
  if (isSelected) {
    if (useAccentStyle) {
      itemStyles.borderColor = npcAccentColor;
      itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
    } else {
      itemStyles.borderColor = '#6B7280';
      bgClasses = "bg-gray-900/70";
    }
  } else {
    itemStyles.borderColor = '#757980';
    bgClasses = 'hover:border-gray-500';
  }

  // Ensure overlay item keeps its correct background/border when selected or default
   if (isOverlay) {
       if (isSelected) {
            if (useAccentStyle) {
                itemStyles.borderColor = npcAccentColor;
                itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
            } else {
                itemStyles.borderColor = '#6B7280';
                itemStyles.backgroundColor = '#1f2937cc';
            }
       } else {
           // Default appearance for overlay item
           itemStyles.borderColor = '#757980';
           itemStyles.backgroundColor = '#111827';
       }
   }

  const baseClasses = cardItemStyles.base;

  return (
    // Set ref and ARIA attributes on container (only original)
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} group`}
      {...(isOverlay ? {} : attributes)}
    >
      {/* Selection Button - Apply LISTENERS here (only to original item) */}
      <button
        onClick={() => !isOverlay && onSelect(conv.id)}
        {...(isOverlay ? {} : listeners)} // Attach drag listeners only to original
        className={`${cardItemStyles.text} pl-4 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }} // Recommended for PointerSensor
        title={isOverlay ? conv.name : (conv.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay}
      >
        {conv.name}
      </button>

      {/* Action Buttons - Hide in overlay */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={(e) => {
            if (!isOverlay) { // Prevent action in overlay
                e.stopPropagation(); // Prevent triggering select/drag
                onEdit(conv.id, conv.name); // Use the passed handler
            }
          }}
          title="Edit Dialogue"
          disabled={isOverlay}
        >
          <Edit size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Main CardSidebar Component ---
const CardSidebar: React.FC<CardSidebarProps> = ({
  onOpenInfoModal,
  onOpenEditModal,
  isDataManagementVisible = false,
  onToggleDataManagement,
  headerButtons,
  betweenHeaderAndContent
}) => {
  const {
    npcs,
    selectedNpcId,
    selectedConversationId,
    selectNpc,
    addNpc,
    selectConversation,
    addConversation,
    selectedNpc: selectedNpcData,
    reorderNpcs,
    reorderConversations,
  } = useSidebarData();

  const [newNpcName, setNewNpcName] = useState<string>('');
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [isAddingNpc, setIsAddingNpc] = useState<boolean>(false);
  const [isAddingConversation, setIsAddingConversation] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(null); // State to track the dragging item's ID

  // Dnd Sensors - Adjusted activation constraints for click vs drag
  const sensors = useSensors(
     useSensor(PointerSensor, {
       // Require the mouse to move by 5 pixels before activating drag
       activationConstraint: {
         distance: 5,
       },
     }),
     useSensor(TouchSensor, {
         // Press delay of 250ms, tolerance of 5px.
         activationConstraint: {
           delay: 250,
           tolerance: 5,
         },
     }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the active item data based on ID for the overlay
  const activeNpc = activeId?.startsWith('npc-') ? npcs.find(npc => npc.id === activeId) : null;
  const activeConv = activeId?.startsWith('conv-') ? selectedNpcData?.conversations.find(conv => conv.id === activeId) : null;


  const handleAddNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      addNpc(newNpcName.trim());
      setNewNpcName('');
      setIsAddingNpc(false);
    }
  };

  const handleAddConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      addConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
      setIsAddingConversation(false);
    }
  };

  // These functions now just call the prop directly
  const handleEditNpc = (npcId: string, name: string, image?: string, accentColor?: string) => {
    onOpenEditModal('NPC', npcId, name, image, accentColor);
  };

  const handleEditConversation = (conversationId: string, name: string) => {
    onOpenEditModal('Dialogue', conversationId, name);
  };

  const emptyStateContent = (message: string) => (
    <div className="text-gray-300 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600">
      {message}
    </div>
  );

   // --- Drag Start Handler ---
   const handleDragStart = (event: DragStartEvent) => {
     setActiveId(String(event.active.id));
   };

   // --- Drag End Handler ---
   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;

     // Reset activeId regardless of whether a valid drop occurred
     setActiveId(null);

     if (!over || active.id === over.id) {
       return; // No move needed
     }

     const activeIdStr = String(active.id);
     const overIdStr = String(over.id);

     // Check if dragging NPCs
     if (activeIdStr.startsWith('npc-') && overIdStr.startsWith('npc-')) {
       const oldIndex = npcs.findIndex((npc) => npc.id === activeIdStr);
       const newIndex = npcs.findIndex((npc) => npc.id === overIdStr);

       if (oldIndex !== -1 && newIndex !== -1) {
         reorderNpcs(oldIndex, newIndex);
       }
     }
     // Check if dragging Conversations within the selected NPC
     else if (activeIdStr.startsWith('conv-') && overIdStr.startsWith('conv-') && selectedNpcData) {
       const conversations = selectedNpcData.conversations || [];
       const oldIndex = conversations.findIndex((conv) => conv.id === activeIdStr);
       const newIndex = conversations.findIndex((conv) => conv.id === overIdStr);

       if (oldIndex !== -1 && newIndex !== -1) {
         reorderConversations(selectedNpcData.id, oldIndex, newIndex);
       }
     }
     // Note: Dragging between NPC and Dialogue lists is implicitly prevented
     // because they are in separate SortableContexts and the logic above checks prefixes.
   };


  return (
    // Wrap relevant parts with DndContext
    <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart} // Set active item on drag start
        onDragEnd={handleDragEnd}     // Handle reordering logic on drag end
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
        <div className="flex flex-col gap-4">
            {/* Header Buttons */}
            <div className="flex justify-start mb-4 px-1 w-64 gap-2 items-center">
                <IconButton
                icon={<Settings size={18} />}
                label="Options (Not Implemented)"
                variant="original"
                />
                <IconButton
                icon={<Info size={18} />}
                onClick={onOpenInfoModal}
                label="Info & Shortcuts"
                variant="original"
                />
                <a
                href="https://rubengalandiaz.notion.site/dialogue-tree-roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
                >
                <IconButton
                    icon={<Map size={18} />}
                    label="Roadmap & Info"
                    variant="original"
                />
                </a>

                {/* Data Management Button */}
                {onToggleDataManagement && (
                <IconButton
                    icon={isDataManagementVisible ? <X size={18} /> : <Database size={18} />}
                    label={isDataManagementVisible ? 'Hide Data Management' : 'Show Data Management'}
                    onClick={onToggleDataManagement}
                    variant="original"
                />
                )}

                {/* Optional additional header buttons */}
                {headerButtons}
            </div>

            {/* Optional content between header and panels */}
            {betweenHeaderAndContent}

            {/* Content Panels */}
            <div className="flex flex-col gap-4">
                {/* NPC Panel */}
                <Panel
                    title="NPCs"
                    actions={
                        <IconButton
                            icon={<Plus size={20} />}
                            onClick={() => setIsAddingNpc(!isAddingNpc)}
                            label="Add NPC"
                            variant="gray"
                        />
                    }
                    variant="sidebar"
                >
                    {isAddingNpc && (
                        <form onSubmit={handleAddNpc} className="mb-3">
                            <Input
                                value={newNpcName}
                                onChange={(e) => setNewNpcName(e.target.value)}
                                placeholder="NPC Name"
                                autoFocus
                                required
                            />
                            <div className={utilStyles.flexBetween + " mt-2"}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsAddingNpc(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    type="submit"
                                >
                                    Add
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* NPC List with SortableContext */}
                    <SortableContext
                        items={npcs.map(npc => npc.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {/* Adjust max-height as needed */}
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
                            {npcs.map((npc) => (
                                <SortableNpcItem
                                    key={npc.id}
                                    npc={npc}
                                    isSelected={npc.id === selectedNpcId}
                                    onSelect={selectNpc}
                                    onEdit={handleEditNpc}
                                    // Pass down whether this specific item is being dragged
                                    isDragging={activeId === npc.id}
                                />
                            ))}
                            {npcs.length === 0 && !isAddingNpc && emptyStateContent("No NPCs created yet. Click & hold items to reorder.")}
                        </div>
                    </SortableContext>
                </Panel>

                {/* Dialogue Panel */}
                <Panel
                    title="Dialogues"
                    actions={
                        npcs.length > 0 && (
                            <IconButton
                                icon={<Plus size={20} />}
                                onClick={() => setIsAddingConversation(!isAddingConversation)}
                                disabled={!selectedNpcId}
                                label={selectedNpcId ? "Add Dialogue" : "Select an NPC first"}
                                variant="gray"
                            />
                        )
                    }
                    variant="sidebar"
                    // Removed scrollable/maxHeight props here, handle scrolling inside
                >
                    {selectedNpcData ? (
                        <>
                            {isAddingConversation && (
                                <form onSubmit={handleAddConversation} className="mb-3">
                                    <Input
                                        value={newConversationName}
                                        onChange={(e) => setNewConversationName(e.target.value)}
                                        placeholder="Dialogue Name"
                                        autoFocus
                                        required
                                    />
                                    <div className={utilStyles.flexBetween + " mt-2"}>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setIsAddingConversation(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            type="submit"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Dialogue List with SortableContext */}
                            <SortableContext
                                items={(selectedNpcData.conversations || []).map(conv => conv.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {/* This div handles the scrolling for dialogues */}
                                {/* Adjust max-height: e.g., calc(PanelMaxHeight - TitleHeight - Padding) */}
                                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 card-scrollbar">
                                    {(selectedNpcData.conversations || []).map((conv) => (
                                        <SortableDialogueItem
                                            key={conv.id}
                                            conv={conv}
                                            isSelected={conv.id === selectedConversationId}
                                            npcAccentColor={selectedNpcData.accentColor}
                                            onSelect={selectConversation}
                                            onEdit={handleEditConversation} // Pass the correct handler
                                            // Pass down whether this specific item is being dragged
                                            isDragging={activeId === conv.id}
                                        />
                                    ))}
                                    {(selectedNpcData.conversations || []).length === 0 && !isAddingConversation &&
                                        emptyStateContent("No dialogues created yet. Click & hold items to reorder.")}
                                </div>
                            </SortableContext>
                        </>
                    ) : (
                        <div className="text-gray-300 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600">
                            {npcs.length > 0 ? 'Select an NPC to see dialogues' : 'Create an NPC first'}
                        </div>
                    )}
                </Panel>
            </div>
        </div>

        {/* Drag Overlay - Renders the component being dragged outside the normal flow */}
        <DragOverlay dropAnimation={null}> {/* Disable default drop animation for smoother sortable transitions */}
            {activeId ? (
                activeNpc ? (
                    // Render NPC item in overlay
                    <SortableNpcItem
                        npc={activeNpc}
                        isSelected={activeNpc.id === selectedNpcId}
                        onSelect={() => {}} // Noop functions for overlay
                        onEdit={() => {}}
                        isDragging={true}    // Indicate it's being dragged
                        isOverlay={true}     // Indicate it's in the overlay
                    />
                ) : activeConv ? (
                    // Render Dialogue item in overlay
                    <SortableDialogueItem
                        conv={activeConv}
                        isSelected={activeConv.id === selectedConversationId}
                        npcAccentColor={selectedNpcData?.accentColor}
                        onSelect={() => {}}
                        onEdit={() => {}}
                        isDragging={true}
                        isOverlay={true}
                    />
                ) : null // Should not happen if activeId is set correctly
            ) : null}
        </DragOverlay>

    </DndContext> // End DndContext
  );
};

export default CardSidebar;