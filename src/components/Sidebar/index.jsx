import React, { useState, memo } from 'react';
import useResizableSidebar from '../../hooks/useResizableSidebar';

/**
 * Enhanced Sidebar for managing NPCs and Conversations with resizable width
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
  
  // Use our custom hook for resizable sidebar
  const { sidebarWidth, isDragging, startResize } = useResizableSidebar(256); // 256px = 16rem (w-64)

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
    <div 
      className="h-full bg-mono-bg text-mono-text flex flex-col overflow-y-auto border-r border-mono-border relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Header */}
      <div className="bg-black px-4 py-3 border-b border-mono-border">
        <h1 className="text-xl font-bold text-mono-text">Dialogue Builder</h1>
        <p className="text-xs text-mono-secondaryText mt-1">Create and manage NPC dialogues</p>
      </div>
      
      {/* NPC Section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-mono-secondaryText">NPCs</h2>
          <button 
            onClick={() => setIsAddingNpc(!isAddingNpc)}
            className="p-1 rounded-full bg-mono-border hover:bg-mono-accent transition-colors"
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
                className="flex-grow px-3 py-2 bg-black text-mono-text text-sm rounded-l-md border border-mono-border focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-mono-text rounded-r-md transition-colors"
              >
                Add
              </button>
            </div>
            <button 
              type="button" 
              onClick={() => setIsAddingNpc(false)}
              className="text-xs text-mono-secondaryText hover:text-mono-text"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingNpc(true)}
            className="w-full mb-4 px-3 py-2 flex justify-center items-center text-sm bg-black hover:bg-mono-border text-mono-secondaryText rounded border border-mono-border transition-colors"
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
                  ? 'bg-blue-600 text-mono-text shadow-md' 
                  : 'text-mono-secondaryText hover:bg-black hover:text-mono-text'
              }`}
            >
              {npc.name}
            </button>
          ))}
          {npcs.length === 0 && (
            <p className="text-mono-secondaryText text-xs italic text-center py-2">No NPCs created yet.</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-mono-border mx-4"></div>

      {/* Conversation Section */}
      <div className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-mono-secondaryText">
            {selectedNpc ? `${selectedNpc.name}'s Dialogues` : 'Dialogues'}
          </h2>
          {selectedNpc && (
            <button 
              onClick={() => setIsAddingConversation(!isAddingConversation)}
              disabled={!selectedNpcId}
              className={`p-1 rounded-full ${
                selectedNpcId 
                  ? 'bg-mono-border hover:bg-mono-accent' 
                  : 'bg-black text-mono-border cursor-not-allowed'
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
                    className="flex-grow px-3 py-2 bg-black text-mono-text text-sm rounded-l-md border border-mono-border focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-mono-text rounded-r-md transition-colors"
                  >
                    Add
                  </button>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAddingConversation(false)}
                  className="text-xs text-mono-secondaryText hover:text-mono-text"
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
                    ? 'bg-black hover:bg-mono-border text-mono-secondaryText' 
                    : 'bg-black text-mono-border cursor-not-allowed'
                } rounded border border-mono-border transition-colors`}
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
                      ? 'bg-green-600 text-mono-text shadow-md' 
                      : 'text-mono-secondaryText hover:bg-black hover:text-mono-text'
                  }`}
                >
                  {conv.name}
                </button>
              ))}
              {selectedNpc.conversations.length === 0 && (
                <p className="text-mono-secondaryText text-xs italic text-center py-2">No dialogues created yet.</p>
              )}
            </div>
          </>
        ) : (
          <div className="bg-black rounded-md p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-mono-border mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-mono-secondaryText text-sm">Select an NPC to see dialogues</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-black p-3 border-t border-mono-border mt-auto">
        <div className="text-xs text-mono-secondaryText text-center">
          <p>Dialogue Tree Builder</p>
          <p className="mt-1">Right-click node to edit</p>
        </div>
      </div>

      {/* Resize handle - distinct protrusion from the sidebar */}
      <div 
        className="absolute top-0 right-0 w-8 h-full cursor-col-resize z-10 flex items-center justify-center"
        onMouseDown={startResize}
        title="Drag to resize sidebar"
      >
        <div className={`absolute top-1/2 -mt-12 -right-2 w-4 h-24 flex items-center justify-center ${isDragging ? 'z-20' : 'z-10'}`}>
          <div className={`w-4 h-20 rounded-r-md ${isDragging ? 'bg-blue-500 shadow-lg' : 'bg-mono-accent'} hover:bg-blue-500 transition-colors flex items-center justify-center shadow-md`}>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="w-1 h-2 bg-mono-text rounded-full"></div>
              <div className="w-1 h-2 bg-mono-text rounded-full"></div>
              <div className="w-1 h-2 bg-mono-text rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Sidebar;