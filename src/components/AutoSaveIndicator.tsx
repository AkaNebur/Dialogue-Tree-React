// src/components/AutoSaveIndicator.tsx
import React, { useState, useEffect } from 'react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
}

/**
 * A visual indicator for auto-save status
 */
const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ 
  isSaving, 
  lastSaved 
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (isSaving) {
      setMessage('Saving...');
      setVisible(true);
    } else if (lastSaved) {
      // Format the timestamp
      const timeStr = lastSaved.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setMessage(`Last saved at ${timeStr}`);
      setVisible(true);
      
      // Hide the message after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 dark:bg-dark-surface text-white py-2 px-4 rounded-lg shadow-lg transition-opacity duration-300 opacity-80">
      <div className="flex items-center">
        {isSaving ? (
          // Spinning loader for saving state
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
        ) : (
          // Checkmark for saved state
          <svg className="h-4 w-4 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default AutoSaveIndicator;