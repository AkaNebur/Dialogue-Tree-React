// src/utils/IdManager.ts
/**
 * IdManager - A utility to manage unique IDs across application restarts
 * 
 * This module handles the generation of guaranteed unique IDs for nodes, NPCs,
 * and conversations by tracking the highest existing ID and persisting counters.
 */

// Define class to handle ID management
class IdManagerClass {
    private nodeIdCounter: number = 10;
    private npcIdCounter: number = 1;
    private convIdCounter: number = 1;
    private initialized: boolean = false;
    private existingNodeIds: Set<string> = new Set();
  
    constructor() {
      // Load saved counters from localStorage on creation
      this.loadCounters();
    }
  
    /**
     * Initialize the ID manager by loading counters from localStorage
     * and scanning for existing IDs
     */
    initialize(): void {
      if (this.initialized) return;
      
      this.loadCounters();
      this.scanExistingIds();
      
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
      // Clear existing set
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
        console.warn("[IdManager] Error scanning existing IDs:", e);
      }
    }
  
    /**
     * Override the original generator functions to use our managed counters
     */
    private overrideGenerators(): void {
      try {
        // Keep reference to original functions if they exist
        const originalGetNextNodeId = window.getNextNodeId;
        const originalGenerateNpcId = window.generateNpcId;
        const originalGenerateConversationId = window.generateConversationId;
        
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
      const nextId = `npc-${this.npcIdCounter++}`;
      this.saveCounters();
      return nextId;
    }
  
    /**
     * Generate a unique conversation ID
     */
    generateConversationId(): string {
      const nextId = `conv-${this.convIdCounter++}`;
      this.saveCounters();
      return nextId;
    }
  
    /**
     * Get the current highest node ID (for debugging)
     */
    getCurrentNodeId(): number {
      return this.nodeIdCounter;
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
  }
  
  // Create a singleton instance
  const IdManager = new IdManagerClass();
  
  // Export the singleton
  export default IdManager;