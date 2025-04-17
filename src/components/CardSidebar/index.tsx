// src/components/CardSidebar/index.tsx
import React, { useState, CSSProperties } from 'react';
import { Plus, Settings, User, Info, Map, Edit, Database, X } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import { NPC, Conversation } from '../../types';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';
import { cardItemStyles } from '../../styles/commonStyles';
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
  DragStartEvent,
  DragOverlay,
  TouchSensor,
  DropAnimation, // <-- Import DropAnimation type
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

// --- Sortable NPC Item Component ---
interface SortableNpcItemProps {
  npc: NPC;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string, name: string, image?: string, accentColor?: string) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}
const SortableNpcItem: React.FC<SortableNpcItemProps> = ({
  npc,
  isSelected,
  onSelect,
  onEdit,
  isDragging: isCurrentlyDragging,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: hookIsDragging,
  } = useSortable({ id: npc.id });

  const showLiftedStyle = isCurrentlyDragging || (isOverlay && hookIsDragging);

  const baseTransform = transform ? CSS.Transform.toString(transform) : '';
  const combinedTransform = showLiftedStyle
    ? `${baseTransform} scale(1.03)`
    : baseTransform;

  const style: CSSProperties = {
    transform: combinedTransform,
    transition: hookIsDragging ? 'none' : transition,
    opacity: hookIsDragging && !isOverlay ? 0 : 1,
    zIndex: showLiftedStyle ? 10 : 'auto',
    position: 'relative',
    boxShadow: showLiftedStyle ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none',
    cursor: showLiftedStyle ? 'grabbing' : 'default',
  };

  const accentColor = npc.accentColor;
  const useAccentStyle = isSelected && accentColor;

  const itemStyles: React.CSSProperties = { borderWidth: '1px', borderStyle: 'solid' };
  let bgClasses = '';

  // Apply background and border based on selection, accent, and overlay status
  if (!isOverlay) {
    if (isSelected) {
      if (useAccentStyle) {
        itemStyles.borderColor = accentColor;
        itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
      } else {
        itemStyles.borderColor = '#6B7280'; // Tailwind gray-500
        bgClasses = "bg-gray-900/70";
      }
    } else {
      itemStyles.borderColor = '#4b5563'; // Tailwind gray-600
      bgClasses = 'hover:border-gray-500'; // Hover border gray-500
    }
  } else { // Style for the drag overlay item
    if (isSelected) {
      if (useAccentStyle) {
        itemStyles.borderColor = accentColor;
        itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
      } else {
        itemStyles.borderColor = '#6B7280';
        itemStyles.backgroundColor = '#1f2937cc'; // Tailwind gray-800 with opacity
      }
    } else {
      itemStyles.borderColor = '#4b5563';
      itemStyles.backgroundColor = '#111827'; // Tailwind gray-900
    }
  }

  const baseClasses = cardItemStyles.base;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} npc-list-item group`}
      {...(isOverlay ? {} : attributes)} // Apply DnD attributes only to the actual item
    >
      {/* Button used for selection and drag handle */}
      <button
        onClick={() => !isOverlay && onSelect(npc.id)}
        {...(isOverlay ? {} : listeners)} // Apply DnD listeners only to the actual item's button
        className={`${cardItemStyles.text} pl-16 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }} // Recommended for pointer/touch sensors
        title={isOverlay ? npc.name : (npc.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay} // Disable interaction on the overlay clone
      >
        {npc.name}
      </button>

      {/* NPC Avatar/Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-gray-600 flex items-center justify-center pointer-events-none">
        {npc.image ? (
          <img src={npc.image} alt={npc.name} className="w-full h-full object-cover" />
        ) : (
          <User size={20} className="text-gray-400" />
        )}
      </div>

      {/* Edit Button */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={(e) => {
            if (!isOverlay) { // Prevent action on overlay
                e.stopPropagation(); // Prevent triggering the parent button's onClick
                onEdit(npc.id, npc.name, npc.image, npc.accentColor);
            }
          }}
          title="Edit NPC"
          disabled={isOverlay} // Disable on overlay
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
  onEdit: (id: string, name: string) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}
const SortableDialogueItem: React.FC<SortableDialogueItemProps> = ({
    conv,
    isSelected,
    npcAccentColor,
    onSelect,
    onEdit,
    isDragging: isCurrentlyDragging,
    isOverlay = false,
 }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: hookIsDragging
  } = useSortable({ id: conv.id });

  const showLifted = isCurrentlyDragging || (isOverlay && hookIsDragging);

  const baseTransform = transform ? CSS.Transform.toString(transform) : '';
  const combinedTransform = showLifted
    ? `${baseTransform} scale(1.03)`
    : baseTransform;

  const style: CSSProperties = {
    transform: combinedTransform,
    transition: hookIsDragging ? 'none' : transition,
    opacity: hookIsDragging && !isOverlay ? 0 : 1,
    zIndex: showLifted ? 10 : 'auto',
    position: 'relative',
    boxShadow: showLifted ? '0 5px 15px rgba(0,0,0,.3)' : 'none',
    cursor: showLifted ? 'grabbing' : 'default',
  };

  const useAccent = isSelected && npcAccentColor;
  const itemStyles: CSSProperties = { borderWidth: 1, borderStyle: 'solid' };
  let bgClasses = '';

  // Apply background and border based on selection, accent, and overlay status
  if (!isOverlay) {
    if (isSelected) {
      if (useAccent) {
        itemStyles.borderColor = npcAccentColor;
        itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
      } else {
        itemStyles.borderColor = '#6B7280';
        bgClasses = 'bg-gray-900/70';
      }
    } else {
      itemStyles.borderColor = '#4b5563';
      bgClasses = 'hover:border-gray-500';
    }
  } else { // Style for the drag overlay item
    if (isSelected) {
      if (useAccent) {
        itemStyles.borderColor = npcAccentColor;
        itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
      } else {
        itemStyles.borderColor = '#6B7280';
        itemStyles.backgroundColor = '#1f2937cc';
      }
    } else {
      itemStyles.borderColor = '#4b5563';
      itemStyles.backgroundColor = '#111827';
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${cardItemStyles.base} ${bgClasses} group`}
      {...(isOverlay ? {} : attributes)} // Apply DnD attributes only to the actual item
    >
      {/* Button used for selection and drag handle */}
      <button
        onClick={() => !isOverlay && onSelect(conv.id)}
        {...(isOverlay ? {} : listeners)} // Apply DnD listeners only to the actual item's button
        className={`${cardItemStyles.text} pl-4 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }}
        title={isOverlay ? conv.name : (conv.name + ' (Click to select, click and hold to drag)')}
        disabled={isOverlay} // Disable interaction on the overlay clone
      >
        {conv.name}
      </button>

      {/* Edit Button */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={e => {
            if (!isOverlay) { // Prevent action on overlay
              e.stopPropagation(); // Prevent triggering the parent button's onClick
              onEdit(conv.id, conv.name);
            }
          }}
          title="Edit Dialogue"
          disabled={isOverlay} // Disable on overlay
        >
          <Edit size={16} />
        </button>
      </div>
    </div>
  );
};


// --- Main CardSidebar Component ---
interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenChangelogModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  betweenHeaderAndContent?: React.ReactNode; // For placing DataActions between header and panels
}

// Custom drop animation configuration for smoother drag release
const customDropAnimation: DropAnimation = {
  duration: 150,
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
};

const CardSidebar: React.FC<CardSidebarProps> = ({
  onOpenInfoModal,
  onOpenChangelogModal,
  onOpenEditModal,
  isDataManagementVisible = false,
  onToggleDataManagement,
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
  const [activeId, setActiveId] = useState<string | null>(null); // Tracks the ID of the item being dragged

  // Setup sensors for dnd-kit
  const sensors = useSensors(
     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Mouse/Pen drag activation
     useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Touch drag activation
     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) // Keyboard support
  );

  // Find the active item data for the DragOverlay based on activeId
  const activeNpc = activeId?.startsWith('npc-') ? npcs.find(npc => npc.id === activeId) : null;
  const activeConv = activeId?.startsWith('conv-') ? selectedNpcData?.conversations.find(conv => conv.id === activeId) : null;

  // Handlers for adding new NPCs and Conversations
  const handleAddNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      addNpc(newNpcName.trim());
      setNewNpcName('');
      setIsAddingNpc(false); // Close the form after adding
    }
  };

  const handleAddConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      addConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
      setIsAddingConversation(false); // Close the form after adding
    }
  };

  // Handlers to open the edit modal
  const handleEditNpc = (npcId: string, name: string, image?: string, accentColor?: string) => {
    onOpenEditModal('NPC', npcId, name, image, accentColor);
  };

  const handleEditConversation = (conversationId: string, name: string) => {
    onOpenEditModal('Dialogue', conversationId, name);
  };

  // Renders placeholder text when lists are empty
  const emptyStateContent = (message: string) => (
    <div className="text-gray-400 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600">
      {message}
    </div>
  );

   // dnd-kit drag event handlers
   const handleDragStart = (event: DragStartEvent) => {
     setActiveId(String(event.active.id));
   };

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;
     setActiveId(null); // Reset active drag ID immediately

     if (!over || active.id === over.id) {
       return; // No movement occurred
     }

     const activeIdStr = String(active.id);
     const overIdStr = String(over.id);

     // Check if we are reordering NPCs
     if (activeIdStr.startsWith('npc-') && overIdStr.startsWith('npc-')) {
       const oldIndex = npcs.findIndex((npc) => npc.id === activeIdStr);
       const newIndex = npcs.findIndex((npc) => npc.id === overIdStr);
       if (oldIndex !== -1 && newIndex !== -1) {
         reorderNpcs(oldIndex, newIndex); // Call store action to reorder
       }
     }
     // Check if we are reordering Conversations for the selected NPC
     else if (activeIdStr.startsWith('conv-') && overIdStr.startsWith('conv-') && selectedNpcData) {
       const conversations = selectedNpcData.conversations || [];
       const oldIndex = conversations.findIndex((conv) => conv.id === activeIdStr);
       const newIndex = conversations.findIndex((conv) => conv.id === overIdStr);
       if (oldIndex !== -1 && newIndex !== -1) {
         reorderConversations(selectedNpcData.id, oldIndex, newIndex); // Call store action
       }
     }
   };


  return (
    <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]} // Restrict dragging
    >
        <div className="flex flex-col gap-4">
            {/* Header Buttons Row */}
            <div className="flex justify-start mb-4 px-1 w-64 gap-2 items-center">
                 <IconButton icon={<Settings size={18} />} label="Options (Not Implemented)" variant="original" disabled />
                 <IconButton icon={<Info size={18} />} onClick={onOpenInfoModal} label="Info & Shortcuts" variant="original" />
                 <IconButton icon={<Map size={18} />} label="Changelog & Roadmap" variant="original" onClick={onOpenChangelogModal} />
                 {onToggleDataManagement && (
                    <IconButton icon={isDataManagementVisible ? <X size={18} /> : <Database size={18} />} label={isDataManagementVisible ? 'Hide Data Management' : 'Show Data Management'} onClick={onToggleDataManagement} variant="original" />
                 )}
                 {/* headerButtons prop removed as it was unused */}
            </div>

            {/* Optional content area (used for DataActions) */}
            {betweenHeaderAndContent}

            {/* Content Panels */}
            <div className="flex flex-col gap-4">
                {/* NPC Panel */}
                <Panel
                    title="NPCs"
                    actions={<IconButton icon={<Plus size={20} />} onClick={() => setIsAddingNpc(true)} label="Add NPC" variant="gray" />}
                    variant="sidebar"
                >
                    {isAddingNpc && (
                        <form onSubmit={handleAddNpc} className="mb-3 flex flex-col gap-1.5">
                            {/* Action Buttons */}
                            <div className="flex justify-end items-center gap-1 mb-1">
                                <Button type="submit" size="sm" variant="primary" className="px-2.5">Add</Button>
                                <IconButton icon={<X size={16} />} onClick={() => setIsAddingNpc(false)} label="Cancel Add NPC" variant="gray" className="p-1.5" />
                            </div>
                            {/* Input Field */}
                            <Input
                                value={newNpcName}
                                onChange={(e) => setNewNpcName(e.target.value)}
                                placeholder="New NPC name..."
                                required
                                autoFocus // Focus the input when it appears
                                sizeVariant="sm" // Use smaller input size
                            />
                        </form>
                    )}
                    <SortableContext items={npcs.map(npc => npc.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
                            {npcs.map((npc) => (
                                <SortableNpcItem
                                    key={npc.id}
                                    npc={npc}
                                    isSelected={npc.id === selectedNpcId}
                                    onSelect={selectNpc}
                                    onEdit={handleEditNpc}
                                    isDragging={activeId === npc.id}
                                />
                            ))}
                            {npcs.length === 0 && !isAddingNpc && emptyStateContent("No NPCs created yet. Click '+' to add one.")}
                        </div>
                    </SortableContext>
                </Panel>

                {/* Dialogue Panel */}
                <Panel
                    title="Dialogues"
                    actions={ npcs.length > 0 && (
                        <IconButton
                            icon={<Plus size={20} />}
                            onClick={() => setIsAddingConversation(true)}
                            disabled={!selectedNpcId}
                            label={selectedNpcId ? "Add Dialogue" : "Select an NPC first"}
                            variant="gray"
                        />
                    )}
                    variant="sidebar"
                >
                    {selectedNpcData ? (
                        <div className="flex flex-col h-full"> {/* Wrapper for flex layout */}
                            {isAddingConversation && (
                                <form onSubmit={handleAddConversation} className="mb-3 flex flex-col gap-1.5">
                                    {/* Action Buttons */}
                                    <div className="flex justify-end items-center gap-1 mb-1">
                                        <Button type="submit" size="sm" variant="primary" className="px-2.5">Add</Button>
                                        <IconButton icon={<X size={16} />} onClick={() => setIsAddingConversation(false)} label="Cancel Add Dialogue" variant="gray" className="p-1.5" />
                                    </div>
                                    {/* Input Field */}
                                    <Input
                                        value={newConversationName}
                                        onChange={(e) => setNewConversationName(e.target.value)}
                                        placeholder="New dialogue name..."
                                        required
                                        autoFocus // Focus the input when it appears
                                        sizeVariant="sm" // Use smaller input size
                                    />
                                </form>
                            )}
                            <SortableContext items={(selectedNpcData.conversations || []).map(conv => conv.id)} strategy={verticalListSortingStrategy}>
                                {/* Scrollable container for the list */}
                                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 card-scrollbar flex-grow">
                                    {(selectedNpcData.conversations || []).map((conv) => (
                                        <SortableDialogueItem
                                            key={conv.id}
                                            conv={conv}
                                            isSelected={conv.id === selectedConversationId}
                                            npcAccentColor={selectedNpcData.accentColor}
                                            onSelect={selectConversation}
                                            onEdit={handleEditConversation}
                                            isDragging={activeId === conv.id}
                                        />
                                    ))}
                                    {(selectedNpcData.conversations || []).length === 0 && !isAddingConversation && emptyStateContent("No dialogues yet. Click '+' to add one.")}
                                </div>
                            </SortableContext>
                        </div>
                    ) : (
                        // Placeholder when no NPC is selected
                        <div className={`text-gray-300 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600 ${isAddingConversation ? 'mt-12' : ''}`}>
                            {npcs.length > 0 ? 'Select an NPC to see dialogues' : 'Create an NPC first'}
                        </div>
                    )}
                </Panel>
            </div>
        </div>

        {/* Drag Overlay: Renders a clone of the dragged item */}
        {/* Uses custom drop animation for a smoother feel */}
        <DragOverlay dropAnimation={customDropAnimation}>
            {activeId ? (
                activeNpc ? ( // Render NPC overlay if activeId matches an NPC
                    <SortableNpcItem
                        npc={activeNpc}
                        isSelected={activeNpc.id === selectedNpcId}
                        onSelect={() => {}} // No action on overlay
                        onEdit={() => {}}   // No action on overlay
                        isDragging={true}   // Indicate it's being dragged
                        isOverlay={true}    // Mark as overlay for styling
                    />
                ) : activeConv ? ( // Render Dialogue overlay if activeId matches a Conversation
                    <SortableDialogueItem
                        conv={activeConv}
                        isSelected={activeConv.id === selectedConversationId}
                        npcAccentColor={selectedNpcData?.accentColor}
                        onSelect={() => {}} // No action on overlay
                        onEdit={() => {}}   // No action on overlay
                        isDragging={true}   // Indicate it's being dragged
                        isOverlay={true}    // Mark as overlay for styling
                    />
                ) : null // Render nothing if activeId doesn't match NPC or Conv
            ) : null}
        </DragOverlay>

    </DndContext>
  );
};

export default CardSidebar;