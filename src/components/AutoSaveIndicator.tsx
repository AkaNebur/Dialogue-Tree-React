// src/components/AutoSaveIndicator.tsx - Updated with new UI components
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useDialogueStore, useSavingStatus } from '../store/dialogueStore';
import { alertStyles } from '../styles/commonStyles';

/**
 * A visual indicator for auto-save status using Zustand store.
 */
const AutoSaveIndicator: React.FC = () => {
  // Use the selector hook to get state for rendering
  const { isSaving, lastSaved, isLoading } = useSavingStatus();
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isLoading) {
      setVisible(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;

    if (isSaving) {
      setMessage('Saving...');
      setVisible(true);
    } else if (lastSaved) {
      const timeStr = lastSaved.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setMessage(`Last saved at ${timeStr}`);
      setVisible(true);

      timer = setTimeout(() => {
        // Use the main store's getState() method here
        if (!useDialogueStore.getState().isSaving) {
          setVisible(false);
        }
      }, 3000);
    } else {
      setVisible(false);
    }

    // Cleanup timer
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, isSaving, lastSaved]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 opacity-80">
      <div className={`flex items-center ${alertStyles.variants.info}`}>
        {isSaving ? (
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full mr-2"></div>
        ) : (
          <Check className="h-4 w-4 text-green-400 mr-2" />
        )}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default AutoSaveIndicator;