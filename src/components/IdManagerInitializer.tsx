// src/components/IdManagerInitializer.tsx
import { useEffect } from 'react';
import IdManager from '../utils/IdManager';

// Type for the React Flow window globals
declare global {
  interface Window {
    getNextNodeId?: () => string;
    generateNpcId?: () => string;
    generateConversationId?: () => string;
  }
}

/**
 * IdManagerInitializer Component
 * 
 * This component initializes the IdManager during the React application lifecycle.
 * It ensures the IdManager is properly set up to track and generate unique IDs.
 */
const IdManagerInitializer: React.FC = () => {
  useEffect(() => {
    // Initialize the ID manager on component mount
    const initializeIdManager = () => {
      try {
        console.log("[IdManagerInitializer] Initializing IdManager...");
        IdManager.initialize();
        console.log("[IdManagerInitializer] IdManager initialized successfully");
        
        // Force a scan of any initial NPCs and conversations
        if (window.localStorage) {
          const savedNpcs = localStorage.getItem('npcs');
          if (savedNpcs) {
            console.log("[IdManagerInitializer] Initial NPC data found, ensuring ID tracking");
            
            // This will re-initialize and scan stored NPCs and conversations
            // to ensure all IDs are properly tracked
            setTimeout(() => {
              IdManager.initialize();
            }, 100);
          }
        }
      } catch (error) {
        console.error("[IdManagerInitializer] Error initializing IdManager:", error);
      }
    };

    // First initialization
    initializeIdManager();

    // Re-scan for IDs periodically to catch any dynamically added nodes
    const scanInterval = setInterval(() => {
      IdManager.initialize();
    }, 10000); // Every 10 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(scanInterval);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default IdManagerInitializer;