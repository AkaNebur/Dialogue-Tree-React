// src/components/Sidebar/index.jsx
import React, { useState, memo } from 'react';

/**
 * Sidebar for managing NPCs and Conversations
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

  const handleAddNpc = (e) => {
    e.preventDefault();
    if (newNpcName.trim()) {
      onAddNpc(newNpcName.trim());
      setNewNpcName('');
    }
  };

  const handleAddConversation = (e) => {
    e.preventDefault();
    if (newConversationName.trim() && selectedNpcId) {
      onAddConversation(selectedNpcId, newConversationName.trim());
      setNewConversationName('');
    }
  };

  const selectedNpc = npcs.find(npc => npc.id === selectedNpcId);

  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4 flex flex-col overflow-y-auto">
      {/* NPC Section */}
      <h2 className="text-lg font-semibold mb-3 border-b border-gray-600 pb-2">NPCs</h2>
      <ul className="mb-4 flex-shrink-0">
        {npcs.map((npc) => (
          <li key={npc.id} className="mb-1">
            <button
              onClick={() => onSelectNpc(npc.id)}
              className={`w-full text-left px-2 py-1 rounded ${
                npc.id === selectedNpcId ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              {npc.name}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddNpc} className="mb-6 flex-shrink-0">
        <input
          type="text"
          value={newNpcName}
          onChange={(e) => setNewNpcName(e.target.value)}
          placeholder="New NPC Name"
          className="w-full p-1 mb-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="w-full px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-700 transition-colors"
        >
          Add NPC
        </button>
      </form>

      {/* Conversation Section (only if an NPC is selected) */}
      {selectedNpc && (
        <>
          <h2 className="text-lg font-semibold mb-3 border-b border-gray-600 pb-2">
            Conversations for {selectedNpc.name}
          </h2>
          <ul className="mb-4 flex-grow"> {/* Use flex-grow for this list */}
            {selectedNpc.conversations.map((conv) => (
              <li key={conv.id} className="mb-1">
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left px-2 py-1 rounded ${
                    conv.id === selectedConversationId ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  {conv.name}
                </button>
              </li>
            ))}
             {selectedNpc.conversations.length === 0 && (
                <li className="text-gray-400 text-sm italic">No conversations yet.</li>
             )}
          </ul>
          <form onSubmit={handleAddConversation} className="mt-auto flex-shrink-0"> {/* Push form to bottom */}
            <input
              type="text"
              value={newConversationName}
              onChange={(e) => setNewConversationName(e.target.value)}
              placeholder="New Conversation Name"
              className="w-full p-1 mb-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-700 transition-colors"
              disabled={!selectedNpcId} // Disable if no NPC selected
            >
              Add Conversation
            </button>
          </form>
        </>
      )}
       {!selectedNpc && (
            <p className="text-gray-400 text-sm italic mt-4">Select an NPC to see conversations.</p>
       )}
    </div>
  );
});

export default Sidebar;