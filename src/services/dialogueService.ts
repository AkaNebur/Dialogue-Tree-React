// src/services/dialogueService.ts
import db from './dbService';
import { NPC } from '../types';
import { initialNpcs } from '../constants/initialData';

/**
 * Save all NPCs data to IndexedDB
 * @param npcs Array of NPCs to save
 * @returns Promise that resolves when saving is complete
 */
export const saveAllNpcs = async (npcs: NPC[]): Promise<void> => {
  try {
    // Clear existing data and add new data in a transaction
    await db.transaction('rw', db.npcs, async () => {
      await db.npcs.clear();
      await db.npcs.bulkAdd(npcs);
    });
    console.log('Successfully saved all NPCs data to IndexedDB');
  } catch (error) {
    console.error('Error saving NPCs data:', error);
    throw error; // Re-throw to allow handling by caller
  }
};

/**
 * Load all NPCs data from IndexedDB
 * @returns Promise that resolves with array of NPCs
 */
export const loadAllNpcs = async (): Promise<NPC[]> => {
  try {
    // Get all NPCs from the database
    const loadedNpcs = await db.npcs.toArray();
    
    // If no data found, return initial NPCs
    if (loadedNpcs.length === 0) {
      console.log('No saved NPCs found in IndexedDB, using initial data');
      return initialNpcs;
    }
    
    console.log(`Loaded ${loadedNpcs.length} NPCs from IndexedDB`);
    return loadedNpcs;
  } catch (error) {
    console.error('Error loading NPCs data:', error);
    return initialNpcs; // Fall back to initial data if there's an error
  }
};

/**
 * Export all dialogue data as JSON
 * @returns Promise that resolves with JSON string
 */
export const exportDialogueData = async (): Promise<string> => {
  const npcs = await loadAllNpcs();
  return JSON.stringify(npcs, null, 2);
};

/**
 * Import dialogue data from JSON
 * @param jsonData JSON string containing NPC data
 * @returns Promise that resolves with success boolean
 */
export const importDialogueData = async (jsonData: string): Promise<boolean> => {
  try {
    // Parse the JSON and validate it's an array
    const npcs = JSON.parse(jsonData) as NPC[];
    
    if (!Array.isArray(npcs)) {
      throw new Error('Imported data is not an array');
    }
    
    // Validate that the data structure has the expected properties
    const isValid = npcs.every(npc => 
      typeof npc.id === 'string' && 
      typeof npc.name === 'string' && 
      Array.isArray(npc.conversations)
    );
    
    if (!isValid) {
      throw new Error('Imported data has invalid structure');
    }
    
    // Save the imported data
    await saveAllNpcs(npcs);
    return true;
  } catch (error) {
    console.error('Error importing dialogue data:', error);
    return false;
  }
};