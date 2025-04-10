// src/components/DatabaseManager.tsx
import React, { useState, useEffect, useCallback } from 'react';
import db from '../services/dbService'; // Import the db instance
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

interface DatabaseManagerProps {
  onReady?: () => void;
}

/**
 * DatabaseManager Component
 *
 * Manages the connection status to the IndexedDB database.
 * Detects connection errors (e.g., version issues) and displays a status indicator.
 * Also provides options to retry connection or clear the database.
 */
const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onReady }) => {
  const [dbError, setDbError] = useState<string | null>(null);
  const [isTryingConnection, setIsTryingConnection] = useState<boolean>(true);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  /**
   * Check the database connection and update status
   */
  const checkDatabaseConnection = async () => {
    setIsTryingConnection(true);
    setDbError(null);
    setShowDetails(false);

    try {
      // Try to open the database connection
      if (!db.isOpen()) {
        await db.open();
      }

      // Get database information
      const info = await db.getDatabaseInfo();
      setDbInfo(info);

      // Check for potential version upgrades needed
      const needsUpgrade = await db.checkVersion();
      if (needsUpgrade) {
        setDbError(
          'Database version mismatch detected. A page reload might be required to apply updates.'
        );
      } else {
        setDbError(null); // Clear any previous errors if connection is successful
      }
      onReady?.(); // Notify parent that DB is ready
    } catch (err: any) {
      setDbError(`Failed to connect to the database. Reason: ${err.message || err.name}`);
      console.error('[DatabaseManager] Error:', err);
    } finally {
      setIsTryingConnection(false);
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []); // Run only on mount

  /**
   * Handle deleting the entire database
   */
  const handleDeleteDatabase = useCallback(async () => {
    if (window.confirm(
      '⚠️ WARNING: This will permanently delete the entire dialogue database from your browser. This action cannot be undone. Are you sure you want to proceed?'
    )) {
      try {
        setIsTryingConnection(true); // Show loading state
        setDbError('Deleting database...');

        // Close the database connection first if open
        if (db.isOpen()) {
          db.close();
        }

        // Delete the database
        await db.delete();

        setDbError('Database deleted successfully. Please reload the page.');
        alert('Database deleted. Reloading the application...');
        window.location.reload(); // Force reload
      } catch (err: any) {
        setDbError(`Failed to delete database. Error: ${err.message || err.name}`);
      } finally {
        setIsTryingConnection(false);
      }
    }
  }, []);

  // Don't render anything if connection is successful and details aren't shown
  if (!dbError && !showDetails && !isTryingConnection) {
    return null;
  }

  return (
    // Position the component at the bottom-left, above the ID Debugger if present
    <div className="fixed bottom-16 left-4 z-50 bg-gray-800 text-white p-4 rounded-lg shadow-xl max-w-sm w-full">
      {/* Panel Content */}
      <div className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
          <h3 className="font-bold flex items-center">
            <AlertCircle size={18} className={`mr-2 ${dbError ? 'text-red-400' : 'text-blue-400'}`} />
            Database Status
          </h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-white text-xs"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Status Message */}
        {dbError ? (
          <div className="bg-red-900/50 border border-red-700 p-3 rounded-md mb-3">
            <p className="text-sm text-red-300 font-medium">Error Encountered:</p>
            <p className="text-xs text-red-300 mt-1 break-words">{dbError}</p>
          </div>
        ) : isTryingConnection ? (
          <div className="flex items-center justify-center text-gray-400 text-sm py-2">
            <RefreshCw size={16} className="animate-spin mr-2" />
            Connecting to database...
          </div>
        ) : (
          <div className="bg-green-900/50 border border-green-700 p-3 rounded-md mb-3">
            <p className="text-sm text-green-300 font-medium">Database connected successfully.</p>
          </div>
        )}

        {/* Database Details (Collapsible) */}
        {showDetails && dbInfo && (
          <div className="bg-gray-900 p-3 rounded-md mb-3 text-xs">
            <h4 className="font-semibold mb-1 text-blue-300">Database Info</h4>
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(dbInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons - Only show if there's an error or details are visible */}
        {(dbError || showDetails) && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={checkDatabaseConnection}
              disabled={isTryingConnection}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={12} className={isTryingConnection ? 'animate-spin' : ''} />
              Retry Connection
            </button>
            {/* Delete Database Button */}
            <button
              onClick={handleDeleteDatabase}
              disabled={isTryingConnection}
              title="Permanently delete the database"
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed text-white px-3 py-1.5 text-xs rounded transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              {isTryingConnection && dbError?.startsWith('Deleting')
                ? 'Deleting...'
                : 'Delete Database'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManager;