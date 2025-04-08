// src/services/dbService.ts
import Dexie, { Table } from 'dexie';
import { NPC } from '../types';

/**
 * DialogueDatabase class for IndexedDB operations
 * Stores all NPCs (which include conversations and nodes)
 */
class DialogueDatabase extends Dexie {
  // Define the NPCs table with NPC type and string primary key
  npcs!: Table<NPC, string>;

  constructor() {
    super('DialogueBuilderDB');
    
    // Define schema - we're storing NPCs as the top-level entity
    // Each NPC contains its own conversations, which contain nodes/edges
    this.version(1).stores({
      npcs: 'id' // Primary key is id
    });
  }
}

// Create a database instance
const db = new DialogueDatabase();

// Export the database
export default db;