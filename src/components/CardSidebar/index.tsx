import React, { useState } from 'react';
import { Plus, Settings, User, Info } from 'lucide-react';
import { useSidebarData } from '../../store/dialogueStore';

// --- Consistent Style Definitions ---
const panelBaseClasses = "bg-blue-50 dark:bg-dark-surface rounded-xl shadow-lg p-3 border-2 border-blue-100 dark:border-dark-border transition-colors duration-300 w-64";
const panelTitleClasses = "text-lg font-semibold text-gray-700 dark:text-gray-300";

const sidebarIconButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1";
const addIconButtonClasses = "bg-blue-100 hover:bg-blue-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-blue-600 dark:text-gray-300 rounded-full p-2 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1";
const addIconDisabledClasses = "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed rounded-full p-2 transition-colors shadow-md";

const inputBaseClasses = "w-full p-2 mb-2 text-sm rounded-md border border-blue-200 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-inner";

const buttonBaseClasses = "flex-1 px-3 py-2 text-sm font-medium rounded-md shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
const buttonPrimaryClasses = `${buttonBaseClasses} text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-blue-500`;
const buttonSecondaryClasses = `${buttonBaseClasses} text-gray-700 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-400`;

const cardItemBaseClasses = "relative rounded-lg shadow-md transition-all duration-200 border";
const cardItemIdleClasses = "bg-white border-blue-100 hover:border-blue-300 dark:bg-dark-bg dark:border-dark-border dark:hover:border-dark-accent";
const cardItemSelectedClasses = "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-900 dark:border-opacity-60";
const cardItemTextClasses = "w-full text-left p-3 pr-10 rounded-lg text-sm font-medium text-gray-800 dark:text-dark-text";
const cardItemIconClasses = "absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-dark-accent p-1.5 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400";
const emptyStateClasses = "text-gray-500 dark:text-gray-400 text-xs italic text-center py-3 px-2 bg-white/50 dark:bg-dark-bg/30 rounded-md";
// --- End Style Definitions ---

interface CardSidebarProps {
  onOpenInfoModal: () => void;
  onOpenEditModal: (type: 'NPC' | 'Dialogue', id: string, name: string, image?: string) => void;
}

const CardSidebar: React.FC<CardSidebarProps> = ({ onOpenInfoModal, onOpenEditModal }) => {
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

  const selectedNpc = selectedNpcData;

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

  const handleEditNpc = (npcId: string, name: string, image?: string) => {
    onOpenEditModal('NPC', npcId, name, image);
  };

  const handleEditConversation = (conversationId: string, name: string) => {
    onOpenEditModal('Dialogue', conversationId, name);
  };

  return (
    <>
      <div className="flex justify-start mb-4 px-1 w-64 gap-2">
        <button className={sidebarIconButtonClasses} title="Options (Not Implemented)">
          <Settings size={18} />
        </button>
        <button onClick={onOpenInfoModal} className={sidebarIconButtonClasses} title="Info & Shortcuts">
          <Info size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <div className={panelBaseClasses}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className={panelTitleClasses}>NPCs</h2>
            <button onClick={() => setIsAddingNpc(!isAddingNpc)} className={addIconButtonClasses} title="Add NPC">
              <Plus size={20} />
            </button>
          </div>

          {isAddingNpc && (
            <form onSubmit={handleAddNpc} className="mb-3 px-1">
              <input type="text" value={newNpcName} onChange={(e) => setNewNpcName(e.target.value)} placeholder="NPC Name" autoFocus className={inputBaseClasses} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAddingNpc(false)} className={buttonSecondaryClasses}>Cancel</button>
                <button type="submit" className={buttonPrimaryClasses}>Add</button>
              </div>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
            {npcs.map((npc) => (
              <div key={npc.id} className={`${cardItemBaseClasses} min-h-[4.5rem] flex items-center ${npc.id === selectedNpcId ? cardItemSelectedClasses : cardItemIdleClasses}`}>
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
                  <Settings size={20} />
                </button>
              </div>
            ))}
            {npcs.length === 0 && !isAddingNpc && ( <div className={emptyStateClasses}> No NPCs created yet </div> )}
          </div>
        </div>

        <div className={`${panelBaseClasses} max-h-80`}>
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className={panelTitleClasses}>Dialogues</h2>
            {npcs.length > 0 && (
               <button
                 onClick={() => setIsAddingConversation(!isAddingConversation)}
                 disabled={!selectedNpcId}
                 title="Add Dialogue"
                 className={`${ selectedNpcId ? addIconButtonClasses : addIconDisabledClasses }`}
               >
                 <Plus size={20} />
               </button>
            )}
          </div>

          {selectedNpc ? (
            <>
              {isAddingConversation && (
                <form onSubmit={handleAddConversation} className="mb-3 px-1">
                  <input type="text" value={newConversationName} onChange={(e) => setNewConversationName(e.target.value)} placeholder="Dialogue Name" autoFocus className={inputBaseClasses}/>
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
                      <Settings size={20} />
                    </button>
                  </div>
                ))}
                {selectedNpc.conversations.length === 0 && !isAddingConversation && ( <div className={emptyStateClasses}> No dialogues created yet </div> )}
              </div>
            </>
          ) : (
             <div className={`${emptyStateClasses} bg-white/70 dark:bg-dark-bg/50 border border-blue-50 dark:border-dark-border shadow-inner p-3`}>
              Select an NPC to see dialogues
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CardSidebar;