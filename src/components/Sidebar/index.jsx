import React, { useState, memo } from 'react';

/**
 * Enhanced Sidebar for managing NPCs and Conversations
 */
const Sidebar = memo(({
  npcs,
  selectedNpcId,
  selectedConversationId,
  onSelectNpc,
  onAddNpc,
  onSelectConversation,
  onAddConversation,
}) => {
  const [newNpcName, setNewNpcName] = useState('');
  const [newConversationName, setNewConversationName] = useState('');
  const [isAddingNpc, setIsAddingNpc] = useState(false);
  const [isAddingConversation, setIsAddingConversation] = useState(false);

  const handleAddNpc = (e) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      onAddNpc(newNpcName.trim());
      setNewNpcName('');
      setIsAddingNpc(false);
    }
  };

  const handleAddConversation = (e) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      onAddConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
      setIsAddingConversation(false);
    }
  };

  const selectedNpc = npcs.find(npc => npc.id === selectedNpcId);

  return (
    <div className="w-64 h-full bg-gray-900 text-gray-100 flex flex-col overflow-y-auto border-r border-gray-700">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Dialogue Builder</h1>
        <p className="text-xs text-gray-400 mt-1">Create and manage NPC dialogues</p>
      </div>
      
      {/* NPC Section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">NPCs</h2>
          <button 
            onClick={() => setIsAddingNpc(!isAddingNpc)}
            className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {isAddingNpc ? (
          <form onSubmit={handleAddNpc} className="mb-4">
            <div className="flex mb-2">
              <input
                type="text"
                value={newNpcName}
                onChange={(e) => setNewNpcName(e.target.value)}
                placeholder="NPC Name"
                className="flex-grow px-3 py-2 bg-gray-800 text-white text-sm rounded-l-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md transition-colors"
              >
                Add
              </button>
            </div>
            <button 
              type="button" 
              onClick={() => setIsAddingNpc(false)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingNpc(true)}
            className="w-full mb-4 px-3 py-2 flex justify-center items-center text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add NPC
          </button>
        )}

        <div className="space-y-1 mb-6 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {npcs.map((npc) => (
            <button
              key={npc.id}
              onClick={() => onSelectNpc(npc.id)}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                npc.id === selectedNpcId 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {npc.name}
            </button>
          ))}
          {npcs.length === 0 && (
            <p className="text-gray-500 text-xs italic text-center py-2">No NPCs created yet.</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mx-4"></div>

      {/* Conversation Section */}
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {selectedNpc ? `${selectedNpc.name}'s Dialogues` : 'Dialogues'}
          </h2>
          {selectedNpc && (
            <button 
              onClick={() => setIsAddingConversation(!isAddingConversation)}
              disabled={!selectedNpcId}
              className={`p-1 rounded-full ${
                selectedNpcId 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-800 text-gray-700 cursor-not-allowed'
              } transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {selectedNpc ? (
          <>
            {isAddingConversation ? (
              <form onSubmit={handleAddConversation} className="mb-4">
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={newConversationName}
                    onChange={(e) => setNewConversationName(e.target.value)}
                    placeholder="Dialogue Name"
                    className="flex-grow px-3 py-2 bg-gray-800 text-white text-sm rounded-l-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-md transition-colors"
                  >
                    Add
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAddingConversation(false)}
                  className="text-xs text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingConversation(true)}
                disabled={!selectedNpcId}
                className={`w-full mb-4 px-3 py-2 flex justify-center items-center text-sm ${
                  selectedNpcId 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-800 text-gray-700 cursor-not-allowed'
                } rounded border border-gray-700 transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Dialogue
              </button>
            )}

            <div className="space-y-1 flex-grow overflow-y-auto pr-1 custom-scrollbar">
              {selectedNpc.conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-all duration-200 ${
                    conv.id === selectedConversationId 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {conv.name}
                </button>
              ))}
              {selectedNpc.conversations.length === 0 && (
                <p className="text-gray-500 text-xs italic text-center py-2">No dialogues created yet.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gray-800 rounded-md p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-400 text-sm">Select an NPC to see dialogues</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 p-3 border-t border-gray-700 mt-auto">
        <div className="text-xs text-gray-500 text-center">
          <p>Dialogue Tree Builder</p>
          <p className="mt-1">Right-click node to edit</p>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;