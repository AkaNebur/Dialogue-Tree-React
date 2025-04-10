// src/utils/IdManager.ts - Fixed Version
/**
 * IdManager - A utility to manage unique IDs across application restarts
 * 
 * This module handles the generation of guaranteed unique IDs for nodes, NPCs,
 * and conversations by tracking the highest existing ID and persisting counters.
 * 
 * Fixed to handle database version issues properly.
 */

// Define class to handle ID management
class IdManagerClass {
  private nodeIdCounter: number = 10;
  private npcIdCounter: number = 1;
  private convIdCounter: number = 1;
  private initialized: boolean = false;
  private existingNodeIds: Set<string> = new Set();
  private existingNpcIds: Set<string> = new Set();
  private existingConvIds: Set<string> = new Set();

  constructor() {
    // Load saved counters from localStorage on creation
    this.loadCounters();
  }

  /**
   * Initialize the ID manager by loading counters from localStorage
   * and scanning for existing IDs in both the DOM and stored data
   */
  initialize(): void {
    // Only initialize once to avoid duplicate ID generation
    if (this.initialized) {
      console.log("[IdManager] Already initialized, scanning for new IDs.");
      this.scanExistingIds();
      return;
    }
    
    this.loadCounters();
    this.scanExistingIds();
    this.scanExistingNpcAndConvIds();
    
    // Override the original generator functions to use our managed counters
    this.overrideGenerators();
    
    this.initialized = true;
    console.log("[IdManager] Initialized with counters:", {
      node: this.nodeIdCounter,
      npc: this.npcIdCounter,
      conv: this.convIdCounter
    });
  }

  /**
   * Load saved counters from localStorage
   */
  private loadCounters(): void {
    try {
      const nodeCounter = localStorage.getItem('dialogueBuilder_nodeIdCounter');
      const npcCounter = localStorage.getItem('dialogueBuilder_npcIdCounter');
      const convCounter = localStorage.getItem('dialogueBuilder_convIdCounter');
      
      if (nodeCounter) this.nodeIdCounter = parseInt(nodeCounter);
      if (npcCounter) this.npcIdCounter = parseInt(npcCounter);
      if (convCounter) this.convIdCounter = parseInt(convCounter);
      
      console.log("[IdManager] Loaded counters from localStorage:", {
        node: this.nodeIdCounter,
        npc: this.npcIdCounter,
        conv: this.convIdCounter
      });
    } catch (e) {
      console.error("[IdManager] Error loading counters:", e);
    }
  }

  /**
   * Save current counter values to localStorage
   */
  private saveCounters(): void {
    try {
      localStorage.setItem('dialogueBuilder_nodeIdCounter', this.nodeIdCounter.toString());
      localStorage.setItem('dialogueBuilder_npcIdCounter', this.npcIdCounter.toString());
      localStorage.setItem('dialogueBuilder_convIdCounter', this.convIdCounter.toString());
    } catch (e) {
      console.error("[IdManager] Error saving counters:", e);
    }
  }

  /**
   * Scan the DOM for existing node elements to detect already used IDs
   */
  private scanExistingIds(): void {
    // Clear existing node IDs set
    this.existingNodeIds.clear();
    
    // Scan for existing nodes in the DOM
    try {
      // Find all node elements in React Flow
      const nodeElements = document.querySelectorAll('[data-id]');
      nodeElements.forEach(element => {
        const nodeId = element.getAttribute('data-id');
        if (nodeId) {
          this.existingNodeIds.add(nodeId);
          
          // Update counter if this ID is higher than our current counter
          const numId = parseInt(nodeId);
          if (!isNaN(numId) && numId >= this.nodeIdCounter) {
            this.nodeIdCounter = numId + 1;
          }
        }
      });
      
      console.log(`[IdManager] Found ${this.existingNodeIds.size} existing node IDs`);
    } catch (e) {
      console.warn("[IdManager] Error scanning existing node IDs:", e);
    }
  }
  
  /**
   * Scan for existing NPC and conversation IDs in stored data
   */
  private scanExistingNpcAndConvIds(): void {
    try {
      // Clear existing sets
      this.existingNpcIds.clear();
      this.existingConvIds.clear();
      
      // Load NPCs from localStorage or IndexedDB if available
      const storedNpcs = localStorage.getItem('npcs');
      if (storedNpcs) {
        const npcs = JSON.parse(storedNpcs);
        
        // Process NPCs and their conversations
        npcs.forEach((npc: any) => {
          // Process NPC ID
          if (npc.id && typeof npc.id === 'string') {
            this.existingNpcIds.add(npc.id);
            
            // Extract numeric part from NPC ID (format: npc-X)
            const npcIdMatch = npc.id.match(/npc-(\d+)/);
            if (npcIdMatch && npcIdMatch[1]) {
              const npcNum = parseInt(npcIdMatch[1]);
              if (!isNaN(npcNum) && npcNum >= this.npcIdCounter) {
                this.npcIdCounter = npcNum + 1;
              }
            }
          }
          
          // Process conversation IDs
          if (npc.conversations && Array.isArray(npc.conversations)) {
            npc.conversations.forEach((conv: any) => {
              if (conv.id && typeof conv.id === 'string') {
                this.existingConvIds.add(conv.id);
                
                // Extract numeric part from conversation ID (format: conv-X)
                const convIdMatch = conv.id.match(/conv-(\d+)/);
                if (convIdMatch && convIdMatch[1]) {
                  const convNum = parseInt(convIdMatch[1]);
                  if (!isNaN(convNum) && convNum >= this.convIdCounter) {
                    this.convIdCounter = convNum + 1;
                    console.log(`[IdManager] Updated conv counter to ${this.convIdCounter} based on ID: ${conv.id}`);
                  }
                }
              }
            });
          }
        });
      }
      
      // Try to access IndexedDB data if available
      this.scanIndexedDB();
      
      console.log(`[IdManager] Found ${this.existingNpcIds.size} existing NPC IDs and ${this.existingConvIds.size} conversation IDs`);
    } catch (e) {
      console.warn("[IdManager] Error scanning existing NPC/conversation IDs:", e);
    }
  }
  
  /**
   * Scan IndexedDB for existing IDs
   * Fixed to handle database versioning properly
   */
  private async scanIndexedDB(): Promise<void> {
    try {
      // Only proceed if IndexedDB is available
      if (!window.indexedDB) return;
      
      // First, check the current database version
      // Open database without specifying version to get current version
      const versionCheckRequest = indexedDB.open('DialogueBuilderDB');
      
      versionCheckRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const currentVersion = db.version;
        db.close();
        
        console.log(`[IdManager] Detected database version: ${currentVersion}`);
        
        // Now open with the correct version
        const dbRequest = indexedDB.open('DialogueBuilderDB', currentVersion);
        
        dbRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Check if npcs store exists
          if (!db.objectStoreNames.contains('npcs')) {
            console.log("[IdManager] No 'npcs' store found in IndexedDB");
            db.close();
            return;
          }
          
          // Start a transaction to get all NPCs
          const transaction = db.transaction(['npcs'], 'readonly');
          const npcsStore = transaction.objectStore('npcs');
          const getAllRequest = npcsStore.getAll();
          
          getAllRequest.onsuccess = () => {
            const npcs = getAllRequest.result;
            
            if (Array.isArray(npcs) && npcs.length > 0) {
              let highestNpcId = 0;
              let highestConvId = 0;
              
              // Process NPCs and their conversations
              npcs.forEach((npc: any) => {
                // Process NPC ID
                if (npc.id && typeof npc.id === 'string') {
                  this.existingNpcIds.add(npc.id);
                  
                  // Extract numeric part from NPC ID (format: npc-X)
                  const npcIdMatch = npc.id.match(/npc-(\d+)/);
                  if (npcIdMatch && npcIdMatch[1]) {
                    const npcNum = parseInt(npcIdMatch[1]);
                    if (!isNaN(npcNum) && npcNum > highestNpcId) {
                      highestNpcId = npcNum;
                    }
                  }
                }
                
                // Process conversation IDs
                if (npc.conversations && Array.isArray(npc.conversations)) {
                  npc.conversations.forEach((conv: any) => {
                    if (conv.id && typeof conv.id === 'string') {
                      this.existingConvIds.add(conv.id);
                      
                      // Extract numeric part from conversation ID (format: conv-X)
                      const convIdMatch = conv.id.match(/conv-(\d+)/);
                      if (convIdMatch && convIdMatch[1]) {
                        const convNum = parseInt(convIdMatch[1]);
                        if (!isNaN(convNum) && convNum > highestConvId) {
                          highestConvId = convNum;
                        }
                      }
                    }
                  });
                }
              });
              
              // Update counters if necessary
              if (highestNpcId >= this.npcIdCounter) {
                this.npcIdCounter = highestNpcId + 1;
                console.log(`[IdManager] Updated NPC counter to ${this.npcIdCounter} from IndexedDB`);
              }
              
              if (highestConvId >= this.convIdCounter) {
                this.convIdCounter = highestConvId + 1;
                console.log(`[IdManager] Updated conversation counter to ${this.convIdCounter} from IndexedDB`);
              }
              
              // Save the updated counters
              this.saveCounters();
            }
            
            db.close();
          };
          
          getAllRequest.onerror = (error) => {
            console.error("[IdManager] Error getting NPCs from IndexedDB:", error);
            db.close();
          };
        };
        
        dbRequest.onerror = (error) => {
          console.error("[IdManager] Error opening IndexedDB:", error);
        };
      };
      
      versionCheckRequest.onerror = (error) => {
        console.warn("[IdManager] Error checking database version. Database might not exist yet:", error);
      };
    } catch (e) {
      console.warn("[IdManager] Error scanning IndexedDB:", e);
    }
  }

  /**
   * Override the original generator functions to use our managed counters
   */
  private overrideGenerators(): void {
    try {
      // Override with our managed versions
      window.getNextNodeId = (): string => {
        return this.generateNodeId();
      };
      
      window.generateNpcId = (): string => {
        return this.generateNpcId();
      };
      
      window.generateConversationId = (): string => {
        return this.generateConversationId();
      };
      
      console.log("[IdManager] Successfully overrode generator functions");
    } catch (e) {
      console.error("[IdManager] Error overriding generators:", e);
    }
  }

  /**
   * Generate a unique node ID
   */
  generateNodeId(): string {
    // Generate a unique ID that isn't already in use
    let nextId: string;
    do {
      nextId = this.nodeIdCounter.toString();
      this.nodeIdCounter++;
    } while (this.existingNodeIds.has(nextId));
    
    // Add to our set of existing IDs
    this.existingNodeIds.add(nextId);
    
    // Save updated counter
    this.saveCounters();
    
    return nextId;
  }

  /**
   * Generate a unique NPC ID
   */
  generateNpcId(): string {
    let nextId = `npc-${this.npcIdCounter}`;
    
    // Ensure the ID is truly unique
    while (this.existingNpcIds.has(nextId)) {
      this.npcIdCounter++;
      nextId = `npc-${this.npcIdCounter}`;
    }
    
    // Increment counter for next generation
    this.npcIdCounter++;
    
    // Add to set of existing IDs
    this.existingNpcIds.add(nextId);
    
    // Save counters
    this.saveCounters();
    
    return nextId;
  }

  /**
   * Generate a unique conversation ID
   */
  generateConversationId(): string {
    let nextId = `conv-${this.convIdCounter}`;
    
    // Ensure the ID is truly unique
    while (this.existingConvIds.has(nextId)) {
      this.convIdCounter++;
      nextId = `conv-${this.convIdCounter}`;
    }
    
    // Increment counter for next generation
    this.convIdCounter++;
    
    // Add to set of existing IDs
    this.existingConvIds.add(nextId);
    
    // Save counters
    this.saveCounters();
    
    console.log(`[IdManager] Generated conversation ID: ${nextId}, next counter: ${this.convIdCounter}`);
    
    return nextId;
  }

  /**
   * Get the current highest node ID (for debugging)
   */
  getCurrentNodeId(): number {
    return this.nodeIdCounter;
  }
  
  /**
   * Get the current highest NPC ID counter (for debugging)
   */
  getCurrentNpcId(): number {
    return this.npcIdCounter;
  }
  
  /**
   * Get the current highest conversation ID counter (for debugging)
   */
  getCurrentConvId(): number {
    return this.convIdCounter;
  }

  /**
   * Reset all counters (for debugging)
   */
  resetCounters(): void {
    this.nodeIdCounter = 10;
    this.npcIdCounter = 1;
    this.convIdCounter = 1;
    this.saveCounters();
    console.log("[IdManager] Counters reset");
  }
  
  /**
   * Get statistics about existing IDs (for debugging)
   */
  getIdStats(): Record<string, any> {
    return {
      counters: {
        node: this.nodeIdCounter,
        npc: this.npcIdCounter,
        conv: this.convIdCounter
      },
      counts: {
        nodes: this.existingNodeIds.size,
        npcs: this.existingNpcIds.size,
        conversations: this.existingConvIds.size
      },
      initialized: this.initialized
    };
  }
}

// Create a singleton instance
const IdManager = new IdManagerClass();

// Export the singleton
export default IdManager;