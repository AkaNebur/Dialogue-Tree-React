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
  DropAnimation, // <-- Import DropAnimation type
  defaultDropAnimationSideEffects, // <-- Optional: Import default effects if needed later
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

// --- Sortable NPC Item Component (No changes needed here) ---
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
    // Transition is handled correctly: disabled during drag, enabled otherwise
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

  if (!isOverlay) {
    if (isSelected) {
      if (useAccentStyle) {
        itemStyles.borderColor = accentColor;
        itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
      } else {
        itemStyles.borderColor = '#6B7280';
        bgClasses = "bg-gray-900/70";
      }
    } else {
      itemStyles.borderColor = '#757980';
      bgClasses = 'hover:border-gray-500';
    }
  } else {
      if (isSelected) {
           if (useAccentStyle) {
               itemStyles.borderColor = accentColor;
               itemStyles.backgroundColor = hexToRgba(accentColor, 0.2);
           } else {
               itemStyles.borderColor = '#6B7280';
               itemStyles.backgroundColor = '#1f2937cc';
           }
      } else {
          itemStyles.borderColor = '#757980';
          itemStyles.backgroundColor = '#111827';
      }
  }

  const baseClasses = cardItemStyles.base;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${baseClasses} ${bgClasses} npc-list-item group`}
      {...(isOverlay ? {} : attributes)}
    >
      <button
        onClick={() => !isOverlay && onSelect(npc.id)}
        {...(isOverlay ? {} : listeners)}
        className={`${cardItemStyles.text} pl-16 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }}
        title={isOverlay ? npc.name : (npc.name + " (Click to select, click and hold to drag)")}
        disabled={isOverlay}
      >
        {npc.name}
      </button>

      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-gray-700 flex items-center justify-center pointer-events-none">
        {npc.image ? (
          <img src={npc.image} alt={npc.name} className="w-full h-full object-cover relative z-10" />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <User size={20} className="text-gray-400" />
          </div>
        )}
      </div>

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


// --- Sortable Dialogue Item Component (No changes needed here) ---
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
    // Transition is handled correctly: disabled during drag, enabled otherwise
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
      itemStyles.borderColor = '#757980';
      bgClasses = 'hover:border-gray-500';
    }
  } else {
    if (isSelected) {
      if (useAccent) {
        itemStyles.borderColor = npcAccentColor;
        itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1);
      } else {
        itemStyles.borderColor = '#6B7280';
        itemStyles.backgroundColor = '#1f2937cc';
      }
    } else {
      itemStyles.borderColor = '#757980';
      itemStyles.backgroundColor = '#111827';
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...itemStyles }}
      className={`${cardItemStyles.base} ${bgClasses} group`}
      {...(isOverlay ? {} : attributes)}
    >
      <button
        onClick={() => !isOverlay && onSelect(conv.id)}
        {...(isOverlay ? {} : listeners)}
        className={`${cardItemStyles.text} pl-4 relative ${isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'none' }}
        title={isOverlay ? conv.name : (conv.name + ' (Click to select, click and hold to drag)')}
        disabled={isOverlay}
      >
        {conv.name}
      </button>
      <div className={cardItemStyles.actions.container} style={{ opacity: isOverlay ? 0 : 1 }}>
        <button
          className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
          onClick={e => {
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
  onOpenChangelogModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  headerButtons?: ReactNode;
  betweenHeaderAndContent?: ReactNode;
}

// --- MODIFICATION: Define custom drop animation configuration ---
const customDropAnimation: DropAnimation = {
  duration: 150, // milliseconds (adjust as needed, default is often 250ms)
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Example easing, adjust or remove for default
  // sideEffects: defaultDropAnimationSideEffects({ // You usually don't need to override sideEffects unless doing advanced things
  //   styles: { active: { opacity: '0.5' } }
  // })
};
// --- END MODIFICATION ---


const CardSidebar: React.FC<CardSidebarProps> = ({
  onOpenInfoModal,
  onOpenChangelogModal,
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
     useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
     setActiveId(null); // Reset activeId FIRST

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
                 <IconButton icon={<Settings size={18} />} label="Options (Not Implemented)" variant="original" disabled />
                 <IconButton icon={<Info size={18} />} onClick={onOpenInfoModal} label="Info & Shortcuts" variant="original" />
                 <IconButton icon={<Map size={18} />} label="Changelog & Roadmap" variant="original" onClick={onOpenChangelogModal} />
                 {onToggleDataManagement && (
                    <IconButton icon={isDataManagementVisible ? <X size={18} /> : <Database size={18} />} label={isDataManagementVisible ? 'Hide Data Management' : 'Show Data Management'} onClick={onToggleDataManagement} variant="original" />
                 )}
                 {headerButtons}
            </div>

            {/* Optional content between header and panels */}
            {betweenHeaderAndContent}

            {/* Content Panels */}
            <div className="flex flex-col gap-4">
                {/* NPC Panel */}
                <Panel title="NPCs" actions={<IconButton icon={<Plus size={20} />} onClick={() => setIsAddingNpc(!isAddingNpc)} label="Add NPC" variant="gray" />} variant="sidebar">
                    {isAddingNpc && ( <form onSubmit={handleAddNpc} className="mb-3"> {/* ... form content ... */} </form> )}
                    <SortableContext items={npcs.map(npc => npc.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
                            {npcs.map((npc) => ( <SortableNpcItem key={npc.id} npc={npc} isSelected={npc.id === selectedNpcId} onSelect={selectNpc} onEdit={handleEditNpc} isDragging={activeId === npc.id} /> ))}
                            {npcs.length === 0 && !isAddingNpc && emptyStateContent("No NPCs created yet. Click & hold items to reorder.")}
                        </div>
                    </SortableContext>
                </Panel>

                {/* Dialogue Panel */}
                <Panel title="Dialogues" actions={ npcs.length > 0 && (<IconButton icon={<Plus size={20} />} onClick={() => setIsAddingConversation(!isAddingConversation)} disabled={!selectedNpcId} label={selectedNpcId ? "Add Dialogue" : "Select an NPC first"} variant="gray" />) } variant="sidebar">
                    {selectedNpcData ? (
                        <>
                            {isAddingConversation && ( <form onSubmit={handleAddConversation} className="mb-3"> {/* ... form content ... */} </form> )}
                            <SortableContext items={(selectedNpcData.conversations || []).map(conv => conv.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1 card-scrollbar">
                                    {(selectedNpcData.conversations || []).map((conv) => ( <SortableDialogueItem key={conv.id} conv={conv} isSelected={conv.id === selectedConversationId} npcAccentColor={selectedNpcData.accentColor} onSelect={selectConversation} onEdit={handleEditConversation} isDragging={activeId === conv.id} /> ))}
                                    {(selectedNpcData.conversations || []).length === 0 && !isAddingConversation && emptyStateContent("No dialogues created yet. Click & hold items to reorder.")}
                                </div>
                            </SortableContext>
                        </>
                    ) : ( <div className="text-gray-300 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600"> {npcs.length > 0 ? 'Select an NPC to see dialogues' : 'Create an NPC first'} </div> )}
                </Panel>
            </div>
        </div>

        {/* --- MODIFICATION: Use custom drop animation config --- */}
        <DragOverlay dropAnimation={customDropAnimation}>
        {/* --- END MODIFICATION --- */}
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