// src/components/DatabaseManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import db from '../services/dbService'; // Import the db instance
import { AlertCircle, RefreshCw, Trash2, X } from 'lucide-react';

interface DatabaseManagerProps {
  onReady?: () => void; // Callback when DB is deemed ready
}

/**
 * DatabaseManager Component - Simplified
 *
 * Manages and displays the initial connection status to IndexedDB.
 * Shows errors prominently if connection fails on startup.
 * Provides options to retry connection or clear the database.
 */
const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onReady }) => {
  const [dbError, setDbError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(true); // Control panel visibility

  /**
   * Check the database connection status.
   */
  const checkDatabaseConnection = useCallback(async (isRetry = false) => {
    setIsChecking(true);
    if (isRetry) setDbError(null); // Clear previous error on retry

    try {
      if (!db.isOpen()) {
        await db.open();
      }
      setDbError(null); // Clear any previous errors
      console.log("[DatabaseManager] Database connection check successful.");
      onReady?.(); // Notify parent that DB seems ready
    } catch (err: any) {
      const errorMessage = `Failed to connect to the database. Reason: ${err.message || err.name || 'Unknown error'}`;
      setDbError(errorMessage);
      console.error('[DatabaseManager] Connection Error:', err);
      setIsVisible(true); // Ensure panel is visible if there's an error
    } finally {
      setIsChecking(false);
    }
  }, [onReady]);

  // Run check on mount
  useEffect(() => {
    checkDatabaseConnection();
  }, [checkDatabaseConnection]);

  /**
   * Handle deleting the entire database.
   */
  const handleDeleteDatabase = useCallback(async () => {
    if (window.confirm(
      '⚠️ WARNING: This will permanently delete the entire dialogue database from your browser. This action cannot be undone. Are you sure you want to proceed?'
    )) {
      try {
        setIsChecking(true);
        setDbError('Deleting database...');

        if (db.isOpen()) {
          db.close();
        }
        await db.delete();

        setDbError('Database deleted successfully. Please reload the page.');
        alert('Database deleted. Reloading the application...');
        window.location.reload();
      } catch (err: any) {
        setDbError(`Failed to delete database. Error: ${err.message || err.name}`);
        console.error('[DatabaseManager] Delete Error:', err);
        setIsChecking(false);
      }
    }
  }, []);

  // Determine visibility based on error or loading state
  const shouldBeVisible = dbError || isChecking;

  if (!isVisible && !shouldBeVisible) {
      return null; // Don't render if hidden and no error/loading
  }

  return (
    <div className={`fixed bottom-4 left-4 z-[60] bg-gray-800 text-white p-3 rounded-lg shadow-xl max-w-sm w-full transition-opacity duration-300 ${shouldBeVisible || isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-sm flex items-center">
            <AlertCircle size={16} className={`mr-1.5 ${dbError ? 'text-red-400' : (isChecking ? 'text-yellow-400' : 'text-green-400')}`} />
            Database Status
          </h3>
          {/* Allow closing only if no error, not checking, and currently visible */}
          {!dbError && !isChecking && isVisible && (
             <button
               onClick={() => setIsVisible(false)}
               className="text-gray-400 hover:text-white p-1 rounded-full"
               title="Hide Status"
              >
               <X size={18} />
             </button>
          )}
        </div>

        {/* Status Message */}
        <div className="text-xs space-y-2">
          {isChecking ? (
            <div className="flex items-center text-gray-400">
              <RefreshCw size={14} className="animate-spin mr-2" />
              {dbError || 'Checking connection...'}
            </div>
          ) : dbError ? (
            <div className="bg-red-900/50 border border-red-700 p-2 rounded">
              <p className="text-red-300 break-words">{dbError}</p>
            </div>
          ) : (
             <p className="text-gray-400 italic">Database connection ok.</p> // Minimal text before hiding
          )}
        </div>


        {/* Action Buttons - Show only if there's an error or checking */}
        {(dbError || isChecking) && (
          <div className="flex space-x-2 mt-3 pt-2 border-t border-gray-700">
            <button
              onClick={() => checkDatabaseConnection(true)} // Pass true for retry
              disabled={isChecking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-2 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} className={isChecking && !dbError?.startsWith('Deleting') ? 'animate-spin' : ''} />
              Retry
            </button>
            <button
              onClick={handleDeleteDatabase}
              disabled={isChecking}
              title="Permanently delete the database"
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-2 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              {isChecking && dbError?.startsWith('Deleting') ? 'Deleting...' : 'Delete DB'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManager;