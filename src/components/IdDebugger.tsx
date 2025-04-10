// src/components/IdDebugger.tsx
import React, { useState, useEffect } from 'react';
import IdManager from '../utils/IdManager';
import db from '../services/dbService'; // Import the database service

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
    npcIdValue: number;
    convIdValue: number;
    nodeIds: string[];
    npcs: string[];
    conversations: string[];
    idStats: Record<string, any>;
  }>({
    nodeIdValue: 0,
    npcIdValue: 0,
    convIdValue: 0,
    nodeIds: [],
    npcs: [],
    conversations: [],
    idStats: {}
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
    // Get ID counter values
    const nodeIdValue = IdManager.getCurrentNodeId();
    const npcIdValue = IdManager.getCurrentNpcId?.() || 0;
    const convIdValue = IdManager.getCurrentConvId?.() || 0;
    const idStats = IdManager.getIdStats?.() || {};
    
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
        npcs = npcData.map((npc: any) => `${npc.id} (${npc.name})`).slice(0, 10);
        
        // Extract all conversation IDs from all NPCs
        const allConversations: string[] = [];
        npcData.forEach((npc: any) => {
          if (npc.conversations) {
            npc.conversations.forEach((conv: any) => {
              allConversations.push(`${conv.id} (${conv.name})`);
            });
          }
        });
        conversations = allConversations.slice(0, 20);
      }
    } catch (e) {
      console.warn('Error getting NPC data for debug panel', e);
    }
    
    setIds({
      nodeIdValue,
      npcIdValue,
      convIdValue,
      nodeIds,
      npcs,
      conversations,
      idStats
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

  // Delete all database information
  const deleteAllData = async () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL data from the database. This action cannot be undone. Are you sure?')) {
      try {
        setIsDeleting(true);
        
        // Clear the NPC table in the database
        await db.npcs.clear();
        
        // Also clear any related localStorage items
        localStorage.removeItem('npcs');
        localStorage.removeItem('selectedNpcId');
        localStorage.removeItem('selectedConversationId');
        
        // Reset ID counters as well for a clean slate
        IdManager.resetCounters();
        
        alert('All database information has been deleted. Reload the page to see the changes.');
        
        // Update the debug info
        updateDebugInfo();
      } catch (error) {
        console.error('Failed to delete database data:', error);
        alert('Failed to delete database data. See console for details.');
      } finally {
        setIsDeleting(false);
      }
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
        {/* Counter Values Section */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">ID Counter Values</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="font-mono bg-gray-900 p-2 rounded">
              <div className="text-xs text-gray-400 mb-1">Node</div>
              <div className="text-green-400">{ids.nodeIdValue}</div>
            </div>
            <div className="font-mono bg-gray-900 p-2 rounded">
              <div className="text-xs text-gray-400 mb-1">NPC</div>
              <div className="text-green-400">{ids.npcIdValue}</div>
            </div>
            <div className="font-mono bg-gray-900 p-2 rounded">
              <div className="text-xs text-gray-400 mb-1">Conversation</div>
              <div className="text-green-400">{ids.convIdValue}</div>
            </div>
          </div>
        </div>

        {/* ID Stats from IdManager */}
        {ids.idStats && Object.keys(ids.idStats).length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-1 text-blue-300">ID Manager Stats</div>
            <div className="font-mono bg-gray-900 p-2 rounded text-xs overflow-x-auto whitespace-pre">
              {JSON.stringify(ids.idStats, null, 2)}
            </div>
          </div>
        )}

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
              ids.npcs.map((npc, i) => (
                <div key={i} className="mb-1 flex items-center">
                  <span className="inline-block w-5 text-gray-400">{i+1}.</span>
                  <span>{npc}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-500 italic">No NPC IDs found</span>
            )}
          </div>
        </div>

        {/* Conversation IDs */}
        <div>
          <div className="text-sm font-semibold mb-1 text-blue-300">Conversation IDs</div>
          <div className="font-mono bg-gray-900 p-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
            {ids.conversations.length > 0 ? (
              ids.conversations.map((conv, i) => (
                <div key={i} className="mb-1 flex items-center">
                  <span className="inline-block w-5 text-gray-400">{i+1}.</span>
                  <span>{conv}</span>
                </div>
              ))
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
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 text-sm rounded transition-colors"
          >
            Reset ID Counters
          </button>
          
          <button
            onClick={updateDebugInfo}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 text-sm rounded transition-colors"
          >
            Refresh Data
          </button>
          
          {/* Database Delete Button */}
          <button
            onClick={deleteAllData}
            disabled={isDeleting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-70 text-white px-3 py-2 text-sm rounded transition-colors flex items-center justify-center"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting Database...
              </>
            ) : (
              '⚠️ Delete All Database Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdDebugger;