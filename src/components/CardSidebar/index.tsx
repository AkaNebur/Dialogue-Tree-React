// src/components/CardSidebar/index.tsx
import React, { useState, ReactNode } from 'react';
import { Plus, Settings, User, Info, Map, Edit, Database, X } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';
import Panel from '../ui/Panel';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Input from '../ui/Input';
import { utilStyles, cardItemStyles } from '../../styles/commonStyles';
import { hexToRgba } from '../../utils/colorUtils';

interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string, accentColor?: string) => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  headerButtons?: ReactNode; // Optional additional header buttons
  betweenHeaderAndContent?: ReactNode; // Optional content to render between header and panels
}

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
  } = useSidebarData();

  const [newNpcName, setNewNpcName] = useState<string>('');
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [isAddingNpc, setIsAddingNpc] = useState<boolean>(false);
  const [isAddingConversation, setIsAddingConversation] = useState<boolean>(false);

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

  // Render NPC list item with optional accent color
  const renderNpcItem = (npc: any) => {
    const isSelected = npc.id === selectedNpcId;
    const accentColor = npc.accentColor; // Get the specific NPC's accent color
    const useAccentStyle = isSelected && accentColor;

    // Inline styles for dynamic colors and border
    const itemStyles: React.CSSProperties = {};
    itemStyles.borderWidth = '1px'; // Always 2px border
    itemStyles.borderStyle = 'solid';

    let bgClasses = ''; // Reset bgClasses

    if (isSelected) {
        if (useAccentStyle) {
            // Use accent color for border and background (via inline style)
            itemStyles.borderColor = accentColor;
            itemStyles.backgroundColor = hexToRgba(accentColor, 0.2); // 20% opacity background
            // No Tailwind background class needed here, inline style takes precedence
        } else {
            // Use default gray border and background (matching app style)
            itemStyles.borderColor = '#6B7280'; // Selected gray border (gray-500)
            bgClasses = "bg-gray-900/70"; // Default selected background
        }
    } else {
        // Idle state - no background, only border
        itemStyles.borderColor = '#757980'; // Lighter gray border for unselected state
        bgClasses = 'hover:border-gray-500'; // Only keep hover effect, remove background
    }

    const baseClasses = cardItemStyles.base; // Base structure from commonStyles

    return (
      <div
        key={npc.id}
        className={`${baseClasses} ${bgClasses} npc-list-item group`} // Combine base, conditional bg, and group
        style={itemStyles} // Apply dynamic inline styles
      >
        <button
          onClick={() => selectNpc(npc.id)}
          className={`${cardItemStyles.text} pl-16 relative`} // Ensure text styles are applied
        >
          {npc.name}
        </button>

        {/* Avatar */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full overflow-hidden bg-gray-700 border border-gray-700 flex items-center justify-center">
          {npc.image ? (
            <img
              src={npc.image}
              alt={npc.name}
              className="w-full h-full object-cover relative z-10"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative z-10">
              <User size={20} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={cardItemStyles.actions.container}>
          <button
            className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
            onClick={(e) => {
              e.stopPropagation();
              handleEditNpc(npc.id, npc.name, npc.image, npc.accentColor);
            }}
            title="Edit NPC"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Render dialogue list item
  const renderDialogueItem = (conv: any) => {
    const isDialogueSelected = conv.id === selectedConversationId;
    const npcAccentColor = selectedNpcData?.accentColor; // Parent NPC accent color
    const useAccentStyle = isDialogueSelected && npcAccentColor;

    // Inline styles for dynamic colors and border
    const itemStyles: React.CSSProperties = {};
    itemStyles.borderWidth = '2px'; // Always 2px border
    itemStyles.borderStyle = 'solid';

    let bgClasses = ''; // Reset bgClasses

    if (isDialogueSelected) {
        if (useAccentStyle) {
            // Use accent color for border and background (via inline style)
            itemStyles.borderColor = npcAccentColor;
            itemStyles.backgroundColor = hexToRgba(npcAccentColor, 0.1); // 10% opacity background
             // No Tailwind background class needed here
        } else {
            // Use default gray border and background (matching app style)
            itemStyles.borderColor = '#6B7280'; // Selected gray border (gray-500)
            bgClasses = "bg-gray-900/70"; // Default selected background
        }
    } else {
        // Idle state - no background, only border
        itemStyles.borderColor = '#757980'; // Lighter gray border for unselected state
        bgClasses = 'hover:border-gray-500'; // Only keep hover effect, remove background
    }

    const baseClasses = cardItemStyles.base; // Base structure from commonStyles

    return (
      <div
        key={conv.id}
        className={`${baseClasses} ${bgClasses} group`} // Combine base, conditional bg, and group
        style={itemStyles} // Apply dynamic inline styles
      >
        <button
          onClick={() => selectConversation(conv.id)}
          className={`${cardItemStyles.text} relative`} // Ensure text styles are applied
        >
          {conv.name}
        </button>

        {/* Action Buttons */}
        <div className={cardItemStyles.actions.container}>
          <button
            className={cardItemStyles.actions.button + ' ' + cardItemStyles.actions.edit}
            onClick={(e) => {
              e.stopPropagation();
              handleEditConversation(conv.id, conv.name);
            }}
            title="Edit Dialogue"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
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

          {/* NPC List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
            {npcs.map(renderNpcItem)}
            {npcs.length === 0 && !isAddingNpc && emptyStateContent("No NPCs created yet")}
          </div>
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
          scrollable
          maxHeight="320px"
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

              {/* Dialogue List */}
              <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 card-scrollbar">
                {selectedNpcData.conversations.map(renderDialogueItem)}
                {selectedNpcData.conversations.length === 0 && !isAddingConversation &&
                  emptyStateContent("No dialogues created yet")}
              </div>
            </>
          ) : (
            <div className="text-gray-300 text-xs italic text-center py-3 px-2 bg-black/40 rounded-md border border-gray-600">
              {npcs.length > 0 ? 'Select an NPC to see dialogues' : 'Create an NPC first'}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default CardSidebar;