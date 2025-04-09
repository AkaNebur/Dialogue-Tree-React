// src/components/IdDebugger.tsx
import React, { useState, useEffect } from 'react';
import IdManager from '../utils/IdManager';

/**
 * IdDebugger Component
 * 
 * Debug panel for monitoring ID generation and resetting counters
 * Add this to your app temporarily when debugging ID issues
 */
const IdDebugger: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [ids, setIds] = useState<{
    nodeIdValue: number;
    nodeIds: string[];
    npcs: string[];
    conversations: string[];
  }>({
    nodeIdValue: 0,
    nodeIds: [],
    npcs: [],
    conversations: []
  });

  // Update debug info when visible
  useEffect(() => {
    if (!visible) return;

    // Get initial data
    updateDebugInfo();
    
    // Set up interval for regular updates
    const interval = setInterval(updateDebugInfo, 2000);
    
    return () => clearInterval(interval);
  }, [visible]);

  // Get the latest debug info
  const updateDebugInfo = () => {
    // Get node ID counter value
    const nodeIdValue = IdManager.getCurrentNodeId();
    
    // Collect existing DOM node IDs
    const nodeElements = document.querySelectorAll('[data-id]');
    const nodeIds = Array.from(nodeElements)
      .map(el => el.getAttribute('data-id'))
      .filter((id): id is string => id !== null)
      .slice(0, 20); // Limit to first 20 for performance
    
    // Get NPCs from localStorage if available
    let npcs: string[] = [];
    let conversations: string[] = [];
    
    try {
      const npcString = localStorage.getItem('npcs');
      if (npcString) {
        const npcData = JSON.parse(npcString);
        npcs = npcData.map((npc: any) => npc.id).slice(0, 10);
        
        // Extract conversation IDs from the first NPC
        if (npcData[0]?.conversations) {
          conversations = npcData[0].conversations.map((conv: any) => conv.id).slice(0, 10);
        }
      }
    } catch (e) {
      console.warn('Error getting NPC data for debug panel', e);
    }
    
    setIds({
      nodeIdValue,
      nodeIds,
      npcs,
      conversations
    });
  };

  // Generate test IDs for debugging
  const generateTestIds = () => {
    const newNodeId = IdManager.generateNodeId();
    const newNpcId = IdManager.generateNpcId();
    const newConvId = IdManager.generateConversationId();
    
    alert(`Generated test IDs:\nNode: ${newNodeId}\nNPC: ${newNpcId}\nConversation: ${newConvId}`);
    
    updateDebugInfo();
  };

  // Reset all counters
  const resetAllCounters = () => {
    if (window.confirm('Are you sure you want to reset all ID counters? This could cause conflicts if you reload without clearing data.')) {
      IdManager.resetCounters();
      updateDebugInfo();
    }
  };

  // Toggle visibility
  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded-md shadow-md transition-colors"
      >
        ID Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-xl max-w-md max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
        <h3 className="font-bold">ID Debug Panel</h3>
        <button 
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        {/* Current Node ID Counter */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">Current Node ID Counter</div>
          <div className="font-mono bg-gray-900 p-2 rounded text-green-400">
            {ids.nodeIdValue}
          </div>
        </div>

        {/* Active Node IDs */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">Active Node IDs ({ids.nodeIds.length})</div>
          <div className="font-mono bg-gray-900 p-2 rounded text-xs overflow-x-auto whitespace-nowrap">
            {ids.nodeIds.length > 0 ? (
              ids.nodeIds.join(', ')
            ) : (
              <span className="text-gray-500 italic">No node IDs found</span>
            )}
          </div>
        </div>

        {/* NPC IDs */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">NPC IDs</div>
          <div className="font-mono bg-gray-900 p-2 rounded text-xs overflow-x-auto whitespace-nowrap">
            {ids.npcs.length > 0 ? (
              ids.npcs.join(', ')
            ) : (
              <span className="text-gray-500 italic">No NPC IDs found</span>
            )}
          </div>
        </div>

        {/* Conversation IDs */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">Conversation IDs</div>
          <div className="font-mono bg-gray-900 p-2 rounded text-xs overflow-x-auto whitespace-nowrap">
            {ids.conversations.length > 0 ? (
              ids.conversations.join(', ')
            ) : (
              <span className="text-gray-500 italic">No conversation IDs found</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={generateTestIds}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded transition-colors"
          >
            Generate Test IDs
          </button>
          
          <button
            onClick={resetAllCounters}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm rounded transition-colors"
          >
            Reset ID Counters
          </button>
          
          <button
            onClick={updateDebugInfo}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 text-sm rounded transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdDebugger;