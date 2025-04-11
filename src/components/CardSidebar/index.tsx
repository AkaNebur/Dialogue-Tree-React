import React, { useState } from 'react';
import { Plus, Settings, User, Info } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';

// Props definition for opening modals managed by the parent component
interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string) => void;
}

const CardSidebar: React.FC<CardSidebarProps> = ({ onOpenInfoModal, onOpenEditModal }) => {
  // Get data and relevant actions from the Zustand store
  const {
    npcs,
    selectedNpcId,
    selectedConversationId,
    selectNpc,
    addNpc,
    selectConversation,
    addConversation,
    selectedNpc: selectedNpcData, // Renamed to avoid conflict with derived variable
  } = useSidebarData();

  // Local state for inline add forms
  const [newNpcName, setNewNpcName] = useState<string>('');
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [isAddingNpc, setIsAddingNpc] = useState<boolean>(false);
  const [isAddingConversation, setIsAddingConversation] = useState<boolean>(false);

  // Derive the full selected NPC object
  const selectedNpc = selectedNpcData;

  // Handle submitting the add NPC form
  const handleAddNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      addNpc(newNpcName.trim());
      setNewNpcName('');
      setIsAddingNpc(false);
    }
  };

  // Handle submitting the add conversation form
  const handleAddConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      addConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
      setIsAddingConversation(false);
    }
  };

  // Trigger the parent component to open the edit modal for an NPC
  const handleEditNpc = (npcId: string, name: string, image?: string) => {
    onOpenEditModal('NPC', npcId, name, image);
  };

  // Trigger the parent component to open the edit modal for a Dialogue
  const handleEditConversation = (conversationId: string, name: string) => {
    onOpenEditModal('Dialogue', conversationId, name);
  };

  const commonButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border";
  const cardClasses = "card-sidebar rounded-xl shadow-lg bg-blue-50 dark:bg-dark-surface p-3 border-2 border-blue-100 dark:border-dark-border w-64 transition-colors duration-300";
  const cardTitleClasses = "card-sidebar-title text-lg font-semibold text-gray-700 dark:text-gray-300";
  const addIconClasses = "bg-blue-100 hover:bg-blue-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-blue-600 dark:text-gray-300 rounded-full p-2 transition-colors shadow-md";
  const inputClasses = "w-full p-3 mb-2 border border-blue-200 dark:border-dark-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-dark-accent shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text";
  const buttonPrimaryClasses = "flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-md";
  const buttonSecondaryClasses = "flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors shadow-md";
  const cardItemBaseClasses = "card-item relative rounded-lg shadow-md transition-all duration-200";
  const cardItemIdleClasses = "bg-white border border-blue-100 hover:border-blue-300 dark:bg-dark-bg dark:border-dark-border dark:hover:border-dark-accent";
  const cardItemSelectedClasses = "bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-900 dark:border-opacity-60";
  const cardItemTextClasses = "w-full text-left p-3 pr-10 rounded-lg text-sm font-medium dark:text-dark-text";
  const cardItemIconClasses = "card-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-dark-accent p-1.5 rounded-full";
  const emptyStateClasses = "card-text text-gray-500 dark:text-gray-400 text-xs italic text-center py-3 bg-white bg-opacity-50 dark:bg-dark-bg dark:bg-opacity-30 rounded-md";

  return (
    <>
      {/* Top action buttons */}
      <div className="flex justify-start mb-4 px-1 w-64 gap-2">
        <button className={commonButtonClasses} title="Options (Not Implemented)">
          <Settings size={18} />
        </button>
        <button onClick={onOpenInfoModal} className={commonButtonClasses} title="Info & Shortcuts">
          <Info size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* NPCs Card */}
        <div className={`${cardClasses}`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className={cardTitleClasses}>NPCs</h2>
            <button onClick={() => setIsAddingNpc(!isAddingNpc)} className={addIconClasses} title="Add NPC">
              <Plus size={20} />
            </button>
          </div>

          {isAddingNpc && (
            <form onSubmit={handleAddNpc} className="mb-3">
              <input type="text" value={newNpcName} onChange={(e) => setNewNpcName(e.target.value)} placeholder="NPC Name" autoFocus className={inputClasses} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAddingNpc(false)} className={buttonSecondaryClasses}>Cancel</button>
                <button type="submit" className={buttonPrimaryClasses}>Add</button>
              </div>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
            {npcs.map((npc) => (
              <div key={npc.id} className={`${cardItemBaseClasses} min-h-16 flex items-center ${npc.id === selectedNpcId ? cardItemSelectedClasses : cardItemIdleClasses}`}>
                <button onClick={() => selectNpc(npc.id)} className={`${cardItemTextClasses} pl-16`}>
                  {npc.name}
                </button>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                  {npc.image ? (
                    <img src={npc.image} alt={npc.name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <button className={cardItemIconClasses} onClick={() => handleEditNpc(npc.id, npc.name, npc.image)} title="Edit NPC">
                  <Settings size={22} />
                </button>
              </div>
            ))}
            {npcs.length === 0 && !isAddingNpc && ( <div className={emptyStateClasses}> No NPCs created yet </div> )}
          </div>
        </div>

        {/* Dialogues Card */}
        <div className={`${cardClasses} max-h-80`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className={cardTitleClasses}>Dialogues</h2>
            {/* Conditionally render Add button only if an NPC could potentially be selected */}
            {npcs.length > 0 && (
               <button
                 onClick={() => setIsAddingConversation(!isAddingConversation)}
                 disabled={!selectedNpcId}
                 title="Add Dialogue"
                 className={`${ selectedNpcId ? addIconClasses : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed rounded-full p-2 transition-colors shadow-md' }`}
               >
                 <Plus size={20} />
               </button>
            )}
          </div>

          {selectedNpc ? (
            <>
              {isAddingConversation && (
                <form onSubmit={handleAddConversation} className="mb-3">
                  <input type="text" value={newConversationName} onChange={(e) => setNewConversationName(e.target.value)} placeholder="Dialogue Name" autoFocus className={inputClasses}/>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsAddingConversation(false)} className={buttonSecondaryClasses}>Cancel</button>
                    <button type="submit" className={buttonPrimaryClasses}>Add</button>
                  </div>
                </form>
              )}

              <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 card-scrollbar">
                {selectedNpc.conversations.map((conv) => (
                  <div key={conv.id} className={`${cardItemBaseClasses} ${conv.id === selectedConversationId ? cardItemSelectedClasses : cardItemIdleClasses}`}>
                    <button onClick={() => selectConversation(conv.id)} className={cardItemTextClasses}>
                      {conv.name}
                    </button>
                    <button className={cardItemIconClasses} onClick={() => handleEditConversation(conv.id, conv.name)} title="Edit Dialogue">
                      <Settings size={22} />
                    </button>
                  </div>
                ))}
                {selectedNpc.conversations.length === 0 && !isAddingConversation && ( <div className={emptyStateClasses}> No dialogues created yet </div> )}
              </div>
            </>
          ) : (
            <div className="card-item bg-white bg-opacity-70 dark:bg-dark-bg dark:bg-opacity-50 rounded-md p-3 text-center border border-blue-50 dark:border-dark-border shadow-inner">
              <p className="card-text text-gray-500 dark:text-gray-400 text-sm">Select an NPC to see dialogues</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CardSidebar;