// src/services/dbService.ts
import Dexie, { Table } from 'dexie';
import { NPC } from '../types';

// *** CHOOSE A FIXED STARTING VERSION (e.g., 1) ***
const DATABASE_VERSION = 1;

/**
 * DialogueDatabase class for IndexedDB operations
 * Stores all NPCs (which include conversations and nodes)
 *
 * Updated with FIXED version handling.
 */
class DialogueDatabase extends Dexie {
  npcs!: Table<NPC, string>;

  constructor() {
    super('DialogueBuilderDB');

    console.log(`[DialogueDatabase] Defining schema version ${DATABASE_VERSION}`);

    // Define schema with a FIXED version number
    this.version(DATABASE_VERSION).stores({
      npcs: 'id' // Primary key is id
    });

    // Optional: Add upgrade logic here if you increment DATABASE_VERSION later
    // this.version(2).stores({ ... }).upgrade(tx => { ... });
  }

  /**
   * Check if the database needs a version update based on the fixed version.
   * NOTE: Dexie handles the actual upgrade process during db.open().
   * This check is more for informational purposes or manual triggers.
   * @returns Promise that resolves with true if the browser DB version is lower than code version.
   */
  async checkVersion(): Promise<boolean> {
    try {
      if (!this.isOpen()) {
        // Temporarily open to check version without triggering full upgrade yet
        // Note: Dexie might still perform upgrades on open() elsewhere.
         await this.open().catch(() => {}); // Allow opening to potentially fail here
         if (!this.isOpen()) return false; // If still not open, can't check
      }
      const db = this.backendDB(); // Access underlying IDBPDatabase
      const currentDbVersion = db.version;
      console.log(`[DialogueDatabase] Code version: ${DATABASE_VERSION}, Browser DB version: ${currentDbVersion}`);
      return currentDbVersion < DATABASE_VERSION;
    } catch (error) {
      console.error('[DialogueDatabase] Error in checkVersion:', error);
      // If check fails, assume an upgrade might be needed or an issue exists
      return true;
    }
  }

  /**
   * Get current database information
   * @returns Object with database info
   */
  async getDatabaseInfo() {
    try {
        if (!this.isOpen()) {
           await this.open().catch(() => {});
           if (!this.isOpen()) return { name: this.name, version: 'N/A (Closed)', stores: [], recordCounts: {} };
         }
      const npcCount = await this.npcs.count();
      const db = this.backendDB();

      return {
        name: this.name,
        version: db.version, // Get actual browser DB version
        stores: Array.from(db.objectStoreNames),
        recordCounts: {
          npcs: npcCount
        }
      };
    } catch (error) {
      console.error('[DialogueDatabase] Error getting database info:', error);
      return null;
    }
  }
}

// Create a database instance
const db = new DialogueDatabase();

// Export the database
export default db;