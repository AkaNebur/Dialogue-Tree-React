// src/components/CardSidebar/index.tsx
import React, { useState, ReactNode, CSSProperties } from 'react';
// Map icon is used for the Changelog/Roadmap button
import { Plus, Settings, User, Info, Map, Edit, Database, X } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import { NPC, Conversation } from '../../types';
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
  DragStartEvent,
  DragOverlay,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
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
  isDragging?: boolean; // Provided by parent to know if ANY drag is active
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
    // transition, // We get this from the hook, but won't use it for animation
    isDragging: hookIsDragging,
  } = useSortable({ id: npc.id });

  const showLiftedStyle = isCurrentlyDragging || (isOverlay && hookIsDragging);

  // Correctly combine transforms
  const baseTransform = CSS.Transform.toString(transform);
  const combinedTransform = showLiftedStyle
    ? `${baseTransform} scale(1.03)` // Apply scale on top of sortable transform
    : baseTransform;

  const style: CSSProperties = {
    transform: combinedTransform, // Use the correctly combined transform
    transition: 'none', // Always set transition to 'none' to prevent snap animation
    opacity: hookIsDragging && !isOverlay ? 0 : 1, // Hide original item when it's the drag source
    zIndex: showLiftedStyle ? 10 : 'auto',
    position: 'relative',
    boxShadow: showLiftedStyle ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none',
    cursor: showLiftedStyle ? 'grabbing' : 'default',
  };

  const accentColor = npc.accentColor;
  const useAccentStyle = isSelected && accentColor;

  const itemStyles: React.CSSProperties = {};
  itemStyles.borderWidth = '1px';
  itemStyles.borderStyle = 'solid';

  let bgClasses = '';

  // Base selection/hover styles (Original Item)
  if (!isOverlay) {
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
  }
  // Styles for the Overlay Item (should match lifted state)
  else {
      // Match the selected state appearance for the overlay
      if (isSelected) {
           if (useAccentStyle) {
               itemStyles.borderColor = accentColor;
               itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
           } else {
               itemStyles.borderColor = '#6B7280'; // gray-500
               itemStyles.backgroundColor = '#1f2937cc'; // Approx bg-gray-800/80 or 900/70
           }
      } else {
          // Match the default appearance for the overlay
          itemStyles.borderColor = '#757980'; // Custom gray
          itemStyles.backgroundColor = '#111827'; // bg-gray-900 (Ensure this matches your base item bg)
      }
  }


  const baseClasses = cardItemStyles.base;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} npc-list-item group`}
      {...(isOverlay ? {} : attributes)} // ARIA attributes only on original
    >
      <button
        onClick={() => !isOverlay && onSelect(npc.id)}
        {...(isOverlay ? {} : listeners)} // Drag listeners only on original
        className={`${cardItemStyles.text} pl-16 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }}
        title={isOverlay ? npc.name : (npc.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay}
      >
        {npc.name}
      </button>

      {/* Avatar */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-gray-700 flex items-center justify-center pointer-events-none">
        {npc.image ? (
          <img src={npc.image} alt={npc.name} className="w-full h-full object-cover relative z-10" />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <User size={20} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={(e) => {
            if (!isOverlay) {
                e.stopPropagation();
                onEdit(npc.id, npc.name, npc.image, npc.accentColor);
            }
          }}
          title="Edit NPC"
          disabled={isOverlay}
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
    // transition, // We get this from the hook, but won't use it for animation
    isDragging: hookIsDragging,
  } = useSortable({ id: conv.id });

  const showLiftedStyle = isCurrentlyDragging || (isOverlay && hookIsDragging);

  // Correctly combine transforms
  const baseTransform = CSS.Transform.toString(transform);
  const combinedTransform = showLiftedStyle
    ? `${baseTransform} scale(1.03)` // Apply scale on top of sortable transform
    : baseTransform;

  const style: CSSProperties = {
    transform: combinedTransform, // Use the correctly combined transform
    transition: 'none', // Always set transition to 'none' to prevent snap animation
    opacity: hookIsDragging && !isOverlay ? 0 : 1, // Hide original item when it's the drag source
    zIndex: showLiftedStyle ? 10 : 'auto',
    position: 'relative',
    boxShadow: showLiftedStyle ? '0 5px 15px rgba(0, 0, 0, 0.3)' : 'none',
    cursor: showLiftedStyle ? 'grabbing' : 'default',
  };

  const useAccentStyle = isSelected && npcAccentColor;

  const itemStyles: React.CSSProperties = {};
  itemStyles.borderWidth = '1px';
  itemStyles.borderStyle = 'solid';

  let bgClasses = '';

  // Base selection/hover styles (Original Item)
  if (!isOverlay) {
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
  }
  // Styles for the Overlay Item (should match lifted state)
   else {
       // Match the selected state appearance for the overlay
       if (isSelected) {
            if (useAccentStyle) {
                itemStyles.borderColor = npcAccentColor;
                itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
            } else {
                itemStyles.borderColor = '#6B7280';
                itemStyles.backgroundColor = '#1f2937cc'; // Approx bg-gray-800/80 or 900/70
            }
       } else {
           // Match the default appearance for the overlay
           itemStyles.borderColor = '#757980'; // Custom gray
           itemStyles.backgroundColor = '#111827'; // bg-gray-900 (Ensure this matches your base item bg)
       }
   }

  const baseClasses = cardItemStyles.base;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} group`}
      {...(isOverlay ? {} : attributes)} // ARIA attributes only on original
    >
      <button
        onClick={() => !isOverlay && onSelect(conv.id)}
        {...(isOverlay ? {} : listeners)} // Drag listeners only on original
        className={`${cardItemStyles.text} pl-4 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }}
        title={isOverlay ? conv.name : (conv.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay}
      >
        {conv.name}
      </button>

      {/* Action Buttons */}
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={(e) => {
            if (!isOverlay) {
                e.stopPropagation();
                onEdit(conv.id, conv.name);
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
interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenChangelogModal: () => void; // <-- Prop added
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  headerButtons?: ReactNode;
  betweenHeaderAndContent?: ReactNode;
}

const CardSidebar: React.FC<CardSidebarProps> = ({
  onOpenInfoModal,
  onOpenChangelogModal, // <-- Destructure prop
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

  const sensors = useSensors(
     useSensor(PointerSensor, {
       activationConstraint: {
         distance: 5,
       },
     }),
     useSensor(TouchSensor, {
         activationConstraint: {
           delay: 250,
           tolerance: 5,
         },
     }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

   const handleDragStart = (event: DragStartEvent) => {
     setActiveId(String(event.active.id));
   };

   const handleDragEnd = (event: DragEndEvent) => {
     const { active, over } = event;

     setActiveId(null); // Reset activeId when drag ends

     if (!over || active.id === over.id) {
       return;
     }

     const activeIdStr = String(active.id);
     const overIdStr = String(over.id);

     if (activeIdStr.startsWith('npc-') && overIdStr.startsWith('npc-')) {
       const oldIndex = npcs.findIndex((npc) => npc.id === activeIdStr);
       const newIndex = npcs.findIndex((npc) => npc.id === overIdStr);

       if (oldIndex !== -1 && newIndex !== -1) {
         reorderNpcs(oldIndex, newIndex);
       }
     }
     else if (activeIdStr.startsWith('conv-') && overIdStr.startsWith('conv-') && selectedNpcData) {
       const conversations = selectedNpcData.conversations || [];
       const oldIndex = conversations.findIndex((conv) => conv.id === activeIdStr);
       const newIndex = conversations.findIndex((conv) => conv.id === overIdStr);

       if (oldIndex !== -1 && newIndex !== -1) {
         reorderConversations(selectedNpcData.id, oldIndex, newIndex);
       }
     }
   };


  return (
    <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
        <div className="flex flex-col gap-4">
            {/* Header Buttons */}
            <div className="flex justify-start mb-4 px-1 w-64 gap-2 items-center">
                 <IconButton
                    icon={<Settings size={18} />}
                    label="Options (Not Implemented)"
                    variant="original"
                    disabled
                />
                 <IconButton
                    icon={<Info size={18} />}
                    onClick={onOpenInfoModal}
                    label="Info & Shortcuts"
                    variant="original"
                 />
                 {/* --- MODIFIED: Roadmap/Info Button --- */}
                 <IconButton
                     icon={<Map size={18} />}
                     label="Changelog & Roadmap" // Updated label
                     variant="original"
                     onClick={onOpenChangelogModal} // Use the new handler
                 />
                 {/* --- END MODIFICATION --- */}

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

                    <SortableContext
                        items={npcs.map(npc => npc.id)}
                        strategy={verticalListSortingStrategy}
                    >
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

                            <SortableContext
                                items={(selectedNpcData.conversations || []).map(conv => conv.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 card-scrollbar">
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

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
            {activeId ? (
                activeNpc ? (
                    <SortableNpcItem
                        npc={activeNpc}
                        isSelected={activeNpc.id === selectedNpcId}
                        onSelect={() => {}}
                        onEdit={() => {}}
                        isDragging={true}
                        isOverlay={true}
                    />
                ) : activeConv ? (
                    <SortableDialogueItem
                        conv={activeConv}
                        isSelected={activeConv.id === selectedConversationId}
                        npcAccentColor={selectedNpcData?.accentColor}
                        onSelect={() => {}}
                        onEdit={() => {}}
                        isDragging={true}
                        isOverlay={true}
                    />
                ) : null
            ) : null}
        </DragOverlay>

    </DndContext>
  );
};

export default CardSidebar;