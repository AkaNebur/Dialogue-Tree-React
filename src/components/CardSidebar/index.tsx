// src/components/CardSidebar/index.tsx
import React, { useState } from 'react';
import { SidebarProps } from '../../types';
import { Plus, Settings, User } from 'lucide-react';
import EditModal from '../EditModal';

// Extended props interface to include name and image updating functions
interface ExtendedSidebarProps extends SidebarProps {
  onUpdateNpcName?: (npcId: string, newName: string) => void;
  onUpdateConversationName?: (conversationId: string, newName: string) => void;
  onUpdateNpcImage?: (npcId: string, imageDataUrl: string | undefined) => void;
}

/**
 * Floating Card-based Sidebar Component with editing modals and profile images
 */
const CardSidebar: React.FC<ExtendedSidebarProps> = ({
  npcs,
  selectedNpcId,
  selectedConversationId,
  onSelectNpc,
  onAddNpc,
  onSelectConversation,
  onAddConversation,
  onUpdateNpcName,
  onUpdateConversationName,
  onUpdateNpcImage,
}) => {
  const [newNpcName, setNewNpcName] = useState<string>('');
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [isAddingNpc, setIsAddingNpc] = useState<boolean>(false);
  const [isAddingConversation, setIsAddingConversation] = useState<boolean>(false);
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEntityType, setEditingEntityType] = useState<'NPC' | 'Dialogue'>('NPC');
  const [editingEntityId, setEditingEntityId] = useState<string>('');
  const [editingEntityName, setEditingEntityName] = useState<string>('');
  const [editingEntityImage, setEditingEntityImage] = useState<string | undefined>(undefined);
  
  const selectedNpc = npcs.find(npc => npc.id === selectedNpcId);

  const handleAddNpc = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      onAddNpc(newNpcName.trim());
      setNewNpcName('');
      setIsAddingNpc(false);
    }
  };

  const handleAddConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      onAddConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
      setIsAddingConversation(false);
    }
  };
  
  // Open edit modal for NPC
  const handleEditNpc = (npcId: string, name: string, image?: string) => {
    setEditingEntityType('NPC');
    setEditingEntityId(npcId);
    setEditingEntityName(name);
    setEditingEntityImage(image);
    setIsEditModalOpen(true);
  };
  
  // Open edit modal for Dialogue/Conversation
  const handleEditConversation = (conversationId: string, name: string) => {
    setEditingEntityType('Dialogue');
    setEditingEntityId(conversationId);
    setEditingEntityName(name);
    setEditingEntityImage(undefined); // No image for dialogues
    setIsEditModalOpen(true);
  };
  
  // Save updated name and/or image
  const handleSaveChanges = (newName: string, imageDataUrl?: string) => {
    if (editingEntityType === 'NPC') {
      // Update NPC name if function is provided
      if (onUpdateNpcName) {
        onUpdateNpcName(editingEntityId, newName);
      }
      
      // Update NPC image if function is provided
      if (onUpdateNpcImage) {
        onUpdateNpcImage(editingEntityId, imageDataUrl);
      }
    } else if (editingEntityType === 'Dialogue' && onUpdateConversationName) {
      // Update dialogue name if function is provided
      onUpdateConversationName(editingEntityId, newName);
    }
    
    // Close modal
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* NPCs Card Container */}
        <div className="card-sidebar rounded-xl shadow-lg bg-blue-50 dark:bg-dark-surface p-3 border border-blue-100 dark:border-dark-border w-64 transition-colors duration-300">
          {/* NPCs Header */}
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="card-sidebar-title text-lg font-semibold text-gray-700 dark:text-gray-300">NPCs</h2>
            <button 
              onClick={() => setIsAddingNpc(!isAddingNpc)}
              className="bg-blue-100 hover:bg-blue-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-blue-600 dark:text-gray-300 rounded-full p-2 transition-colors shadow-md"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Add NPC Form */}
          {isAddingNpc ? (
            <form onSubmit={handleAddNpc} className="mb-3">
              <input
                type="text"
                value={newNpcName}
                onChange={(e) => setNewNpcName(e.target.value)}
                placeholder="NPC Name"
                className="w-full p-3 mb-2 border border-blue-200 dark:border-dark-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-dark-accent shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingNpc(false)}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-md"
                >
                  Add
                </button>
              </div>
            </form>
          ) : null}
          
          {/* NPC Cards */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 card-scrollbar">
            {npcs.map((npc) => (
              <div
                key={npc.id}
                className={`card-item relative rounded-lg shadow-md ${
                  npc.id === selectedNpcId 
                    ? 'bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-900 dark:border-opacity-60' 
                    : 'bg-white border border-blue-100 hover:border-blue-300 dark:bg-dark-bg dark:border-dark-border dark:hover:border-dark-accent'
                } transition-all duration-200`}
              >
                <button
                  onClick={() => onSelectNpc(npc.id)}
                  className="w-full text-left p-3 pl-16 pr-10 rounded-lg text-sm font-medium dark:text-dark-text"
                >
                  {npc.name}
                </button>
                
                {/* Profile Image or Avatar */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
                  {npc.image ? (
                    <img 
                      src={npc.image} 
                      alt={npc.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={20} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Edit Button */}
                <button 
                  className="card-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-dark-accent p-1.5 rounded-full"
                  onClick={() => handleEditNpc(npc.id, npc.name, npc.image)}
                  title="Edit NPC"
                >
                  <Settings size={22} />
                </button>
              </div>
            ))}
            {npcs.length === 0 && !isAddingNpc && (
              <div className="card-text text-gray-500 dark:text-gray-400 text-xs italic text-center py-3 bg-white bg-opacity-50 dark:bg-dark-bg dark:bg-opacity-30 rounded-md">
                No NPCs created yet
              </div>
            )}
          </div>
        </div>

        {/* Dialogues Card Container */}
        <div className="card-sidebar rounded-xl shadow-lg bg-blue-50 dark:bg-dark-surface p-3 border border-blue-100 dark:border-dark-border w-64 max-h-80 transition-colors duration-300">
          {/* Dialogues Header */}
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="card-sidebar-title text-lg font-semibold text-gray-700 dark:text-gray-300">Dialogues</h2>
            {selectedNpc && (
              <button 
                onClick={() => setIsAddingConversation(!isAddingConversation)}
                disabled={!selectedNpcId}
                className={`${
                  selectedNpcId 
                    ? 'bg-blue-100 hover:bg-blue-200 dark:bg-dark-bg dark:hover:bg-gray-800 text-blue-600 dark:text-gray-300' 
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                } rounded-full p-2 transition-colors shadow-md`}
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {selectedNpc ? (
            <>
              {/* Add Dialogue Form */}
              {isAddingConversation ? (
                <form onSubmit={handleAddConversation} className="mb-3">
                  <input
                    type="text"
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Dialogue Name"
                    className="w-full p-3 mb-2 border border-blue-200 dark:border-dark-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-dark-accent shadow-inner bg-white dark:bg-dark-bg dark:text-dark-text"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingConversation(false)}
                      className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium transition-colors shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-md"
                    >
                      Add
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Dialogue Cards */}
              <div className="space-y-1.5 overflow-y-auto max-h-48 pr-1 card-scrollbar">
                {selectedNpc.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`card-item relative rounded-lg shadow-md ${
                      conv.id === selectedConversationId 
                        ? 'bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-900 dark:border-opacity-60' 
                        : 'bg-white border border-blue-100 hover:border-blue-300 dark:bg-dark-bg dark:border-dark-border dark:hover:border-dark-accent'
                    } transition-all duration-200`}
                  >
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      className="w-full text-left p-3 pr-10 rounded-lg text-sm font-medium dark:text-dark-text"
                    >
                      {conv.name}
                    </button>
                    <button 
                      className="card-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-dark-accent p-1.5 rounded-full"
                      onClick={() => handleEditConversation(conv.id, conv.name)}
                      title="Edit Dialogue"
                    >
                      <Settings size={22} />
                    </button>
                  </div>
                ))}
                {selectedNpc.conversations.length === 0 && !isAddingConversation && (
                  <div className="card-text text-gray-500 dark:text-gray-400 text-xs italic text-center py-3 bg-white bg-opacity-50 dark:bg-dark-bg dark:bg-opacity-30 rounded-md">
                    No dialogues created yet
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card-item bg-white bg-opacity-70 dark:bg-dark-bg dark:bg-opacity-50 rounded-md p-3 text-center border border-blue-50 dark:border-dark-border shadow-inner">
              <p className="card-text text-gray-500 dark:text-gray-400 text-sm">Select an NPC to see dialogues</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveChanges}
        title={`Edit ${editingEntityType} ${editingEntityType === 'NPC' ? 'Profile' : 'Name'}`}
        currentName={editingEntityName}
        currentImage={editingEntityImage}
        entityType={editingEntityType}
      />
    </>
  );
};

export default CardSidebar;