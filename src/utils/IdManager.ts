import { NPC } from '../types';

class IdManagerClass {
  private nodeIdCounter: number = 10;
  private npcIdCounter: number = 1;
  private convIdCounter: number = 1;

  constructor() {
    this.loadCounters();
    console.log("[IdManager] Instantiated. Counters loaded:", this.getCounters());
  }

  private loadCounters(): void {
    try {
      const nodeCounter = localStorage.getItem('dialogueBuilder_nodeIdCounter');
      const npcCounter = localStorage.getItem('dialogueBuilder_npcIdCounter');
      const convCounter = localStorage.getItem('dialogueBuilder_convIdCounter');

      this.nodeIdCounter = nodeCounter ? parseInt(nodeCounter, 10) : 10;
      this.npcIdCounter = npcCounter ? parseInt(npcCounter, 10) : 1;
      this.convIdCounter = convCounter ? parseInt(convCounter, 10) : 1;

      // Ensure counters are valid numbers and meet minimums
      if (isNaN(this.nodeIdCounter) || this.nodeIdCounter < 10) this.nodeIdCounter = 10;
      if (isNaN(this.npcIdCounter) || this.npcIdCounter < 1) this.npcIdCounter = 1;
      if (isNaN(this.convIdCounter) || this.convIdCounter < 1) this.convIdCounter = 1;
    } catch (e) {
      console.error("[IdManager] Error loading counters:", e);
      // Fallback to defaults on error
      this.nodeIdCounter = 10;
      this.npcIdCounter = 1;
      this.convIdCounter = 1;
    }
  }

  private saveCounters(): void {
    try {
      localStorage.setItem('dialogueBuilder_nodeIdCounter', this.nodeIdCounter.toString());
      localStorage.setItem('dialogueBuilder_npcIdCounter', this.npcIdCounter.toString());
      localStorage.setItem('dialogueBuilder_convIdCounter', this.convIdCounter.toString());
    } catch (e) {
      console.error("[IdManager] Error saving counters:", e);
    }
  }

  syncWithData(npcs: NPC[]): void {
    if (!npcs || !Array.isArray(npcs)) {
      console.warn("[IdManager] syncWithData received invalid data.");
      return;
    }

    let highestNodeId = 0;
    let highestNpcNum = 0;
    let highestConvNum = 0;
    let idsFound = false; // Track if any relevant IDs were processed

    try {
      npcs.forEach((npc: NPC) => {
        if (npc.id?.startsWith('npc-')) {
          idsFound = true;
          const num = parseInt(npc.id.substring(4), 10);
          if (!isNaN(num) && num > highestNpcNum) highestNpcNum = num;
        }
        npc.conversations?.forEach((conv) => {
          if (conv.id?.startsWith('conv-')) {
            idsFound = true;
            const num = parseInt(conv.id.substring(5), 10);
            if (!isNaN(num) && num > highestConvNum) highestConvNum = num;
          }
          conv.nodes?.forEach(node => {
            // Node IDs are expected to be numeric strings
             if (node.id && /^\d+$/.test(node.id)) {
                idsFound = true;
                const num = parseInt(node.id, 10);
                if (!isNaN(num) && num > highestNodeId) highestNodeId = num;
             }
          });
        });
      });

      let countersUpdated = false;
      // Only update if a higher ID was found AND IDs were actually processed
      if (idsFound && highestNodeId >= this.nodeIdCounter) {
        this.nodeIdCounter = highestNodeId + 1;
        countersUpdated = true;
      }
      if (idsFound && highestNpcNum >= this.npcIdCounter) {
        this.npcIdCounter = highestNpcNum + 1;
        countersUpdated = true;
      }
      if (idsFound && highestConvNum >= this.convIdCounter) {
        this.convIdCounter = highestConvNum + 1;
        countersUpdated = true;
      }

      if (idsFound) {
        console.log(`[IdManager] Sync complete. Highest IDs found: Node=${highestNodeId}, NPC-Num=${highestNpcNum}, Conv-Num=${highestConvNum}.`);
        if (countersUpdated) {
          console.log("[IdManager] Counters updated to:", this.getCounters());
          this.saveCounters();
        } else {
          console.log("[IdManager] Counters remain at:", this.getCounters());
        }
      } else {
        console.log("[IdManager] No relevant IDs found during sync. Counters remain at:", this.getCounters());
      }

    } catch (e) {
      console.error("[IdManager] Error during syncWithData:", e);
    }
  }

  generateNodeId(): string {
    const nextId = this.nodeIdCounter.toString();
    this.nodeIdCounter++;
    this.saveCounters();
    return nextId;
  }

  generateNpcId(): string {
    const nextId = `npc-${this.npcIdCounter}`;
    this.npcIdCounter++;
    this.saveCounters();
    return nextId;
  }

  generateConversationId(): string {
    const nextId = `conv-${this.convIdCounter}`;
    this.convIdCounter++;
    this.saveCounters();
    return nextId;
  }

  getCounters(): Record<string, number> {
    return {
      node: this.nodeIdCounter,
      npc: this.npcIdCounter,
      conv: this.convIdCounter
    };
  }

  resetCounters(): void {
    this.nodeIdCounter = 10;
    this.npcIdCounter = 1;
    this.convIdCounter = 1;
    this.saveCounters();
    console.log("[IdManager] Counters reset to:", this.getCounters());
  }
}

const IdManager = new IdManagerClass();
export default IdManager;