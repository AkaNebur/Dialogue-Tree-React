// src/components/CardSidebar/index.tsx
import React, { useState } from 'react';
import { SidebarProps } from '../../types';
import { Plus, Settings } from 'lucide-react';

/**
 * Floating Card-based Sidebar Component
 * Displays as floating cards on top of the React Flow panel
 */
const CardSidebar: React.FC<SidebarProps> = ({
  npcs,
  selectedNpcId,
  selectedConversationId,
  onSelectNpc,
  onAddNpc,
  onSelectConversation,
  onAddConversation,
}) => {
  const [newNpcName, setNewNpcName] = useState<string>('');
  const [newConversationName, setNewConversationName] = useState<string>('');
  const [isAddingNpc, setIsAddingNpc] = useState<boolean>(false);
  const [isAddingConversation, setIsAddingConversation] = useState<boolean>(false);
  
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

  return (
    <div className="flex flex-col gap-4">
      {/* NPCs Card Container */}
      <div className="rounded-2xl shadow-lg bg-blue-50 p-4 border-2 border-blue-100 w-72">
        {/* NPCs Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-semibold text-blue-600">NPCs</h2>
          <button 
            onClick={() => setIsAddingNpc(!isAddingNpc)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full p-2 transition-colors shadow-md"
          >
            <Plus size={24} />
          </button>
        </div>
        
        {/* Add NPC Form */}
        {isAddingNpc ? (
          <form onSubmit={handleAddNpc} className="mb-4">
            <input
              type="text"
              value={newNpcName}
              onChange={(e) => setNewNpcName(e.target.value)}
              placeholder="NPC Name"
              className="w-full p-3 mb-2 border-2 border-blue-200 rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner bg-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setIsAddingNpc(false)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
              >
                Add
              </button>
            </div>
          </form>
        ) : null}
        
        {/* NPC Cards */}
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 card-scrollbar">
          {npcs.map((npc) => (
            <div
              key={npc.id}
              className={`relative rounded-xl border-2 shadow-md ${
                npc.id === selectedNpcId 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-white border-blue-100 hover:border-blue-300'
              } transition-all duration-200`}
            >
              <button
                onClick={() => onSelectNpc(npc.id)}
                className="w-full text-left p-4 pr-12 rounded-xl text-md font-medium"
              >
                {npc.name}
              </button>
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1 rounded-full">
                <Settings size={18} />
              </button>
            </div>
          ))}
          {npcs.length === 0 && !isAddingNpc && (
            <div className="text-blue-400 text-sm italic text-center py-6 bg-white bg-opacity-50 rounded-xl">
              No NPCs created yet
            </div>
          )}
        </div>
      </div>

      {/* Dialogues Card Container */}
      <div className="rounded-2xl shadow-lg bg-blue-50 p-4 border-2 border-blue-100 w-72 max-h-96">
        {/* Dialogues Header */}
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-semibold text-blue-600">Dialogues</h2>
          {selectedNpc && (
            <button 
              onClick={() => setIsAddingConversation(!isAddingConversation)}
              disabled={!selectedNpcId}
              className={`${
                selectedNpcId 
                  ? 'bg-blue-100 hover:bg-blue-200 text-blue-600' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } rounded-full p-2 transition-colors shadow-md`}
            >
              <Plus size={24} />
            </button>
          )}
        </div>

        {selectedNpc ? (
          <>
            {/* Add Dialogue Form */}
            {isAddingConversation ? (
              <form onSubmit={handleAddConversation} className="mb-4">
                <input
                  type="text"
                  value={newConversationName}
                  onChange={(e) => setNewConversationName(e.target.value)}
                  placeholder="Dialogue Name"
                  className="w-full p-3 mb-2 border-2 border-blue-200 rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner bg-white"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingConversation(false)}
                    className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                  >
                    Add
                  </button>
                </div>
              </form>
            ) : null}

            {/* Dialogue Cards */}
            <div className="space-y-3 overflow-y-auto max-h-64 pr-1 card-scrollbar">
              {selectedNpc.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`relative rounded-xl border-2 shadow-md ${
                    conv.id === selectedConversationId 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-white border-blue-100 hover:border-blue-300'
                  } transition-all duration-200`}
                >
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="w-full text-left p-4 pr-12 rounded-xl text-md font-medium"
                  >
                    {conv.name}
                  </button>
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1 rounded-full">
                    <Settings size={18} />
                  </button>
                </div>
              ))}
              {selectedNpc.conversations.length === 0 && !isAddingConversation && (
                <div className="text-blue-400 text-sm italic text-center py-6 bg-white bg-opacity-50 rounded-xl">
                  No dialogues created yet
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white bg-opacity-70 rounded-xl p-6 text-center border-2 border-blue-50 shadow-inner">
            <p className="text-blue-400 text-md">Select an NPC to see dialogues</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSidebar;