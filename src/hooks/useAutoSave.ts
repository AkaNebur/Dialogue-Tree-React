// src/hooks/useAutoSave.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { saveAllNpcs } from '../services/dialogueService';
import { NPC } from '../types';

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveData: (data: NPC[]) => void;
  saveImmediately: (data: NPC[]) => Promise<void>;
}

/**
 * Custom hook to handle auto-saving data
 * @param debounceTime Time in ms to wait before saving after changes
 * @returns Auto-save state and functions
 */
const useAutoSave = (debounceTime = 1500): UseAutoSaveReturn => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Function to perform the actual save
  const performSave = async (data: NPC[]): Promise<void> => {
    if (!data || data.length === 0) return;
    
    try {
      setIsSaving(true);
      await saveAllNpcs(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(performSave, debounceTime),
    [debounceTime]
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Regular save function that uses debounce
  const saveData = useCallback(
    (data: NPC[]) => {
      debouncedSave(data);
    },
    [debouncedSave]
  );

  // Immediate save function (bypasses debounce)
  const saveImmediately = useCallback(
    async (data: NPC[]) => {
      debouncedSave.cancel(); // Cancel any pending debounced saves
      await performSave(data);
    },
    [debouncedSave]
  );

  return {
    isSaving,
    lastSaved,
    saveData,
    saveImmediately,
  };
};

export default useAutoSave;