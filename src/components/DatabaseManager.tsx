import React, { useState, useEffect, useCallback } from 'react';
import db from '../services/dbService';
import { AlertCircle, RefreshCw, Trash2, X, CheckCircle } from 'lucide-react'; // Added CheckCircle

// --- Consistent Style Definitions ---
const panelBaseClasses = "fixed bottom-4 left-4 z-[60] max-w-sm w-full rounded-lg shadow-xl transition-opacity duration-300";
const panelErrorClasses = "bg-red-800 border border-red-600 text-red-100";
const panelLoadingClasses = "bg-yellow-700 border border-yellow-500 text-yellow-100";
const panelSuccessClasses = "bg-gray-800 border border-gray-700 text-white"; // Default/Success state

const panelHeaderClasses = "flex justify-between items-center p-3 border-b"; // Combined header/body padding
const panelTitleClasses = "font-semibold text-sm flex items-center";
const panelBodyClasses = "p-3 text-xs space-y-2";
const panelFooterClasses = "flex space-x-2 p-3 border-t";

const iconButtonClasses = "text-gray-400 hover:text-white p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-white";

const buttonBaseClasses = "flex-1 px-2 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-current"; // Added focus styles
const buttonRetryClasses = `${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400 disabled:opacity-70 disabled:cursor-not-allowed`;
const buttonDeleteClasses = `${buttonBaseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 disabled:opacity-70 disabled:cursor-not-allowed`;
// --- End Style Definitions ---

interface DatabaseManagerProps {
  onReady?: () => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onReady }) => {
  const [dbStatus, setDbStatus] = useState<'checking' | 'error' | 'success' | 'deleting'>('checking');
  const [dbMessage, setDbMessage] = useState<string>('Checking connection...');
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const checkDatabaseConnection = useCallback(async (isRetry = false) => {
    setDbStatus(isRetry ? 'checking' : 'checking'); // Ensure status is checking
    setDbMessage('Checking connection...');
    try {
      if (!db.isOpen()) await db.open();
      setDbStatus('success');
      setDbMessage('Database connection successful.');
      onReady?.();
      // Optionally auto-hide after success
      // setTimeout(() => setIsVisible(false), 3000);
    } catch (err: any) {
      const errorMessage = `Failed to connect. Reason: ${err.message || err.name || 'Unknown error'}`;
      setDbStatus('error');
      setDbMessage(errorMessage);
      setIsVisible(true); // Ensure visible on error
    }
  }, [onReady]);

  useEffect(() => {
    checkDatabaseConnection();
  }, [checkDatabaseConnection]);

  const handleDeleteDatabase = useCallback(async () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete the entire dialogue database from your browser. This action cannot be undone. Are you sure?')) {
      setDbStatus('deleting');
      setDbMessage('Deleting database...');
      try {
        if (db.isOpen()) db.close();
        await db.delete();
        setDbMessage('Database deleted. Reloading...');
        alert('Database deleted. Reloading the application...');
        window.location.reload();
      } catch (err: any) {
        setDbStatus('error');
        setDbMessage(`Failed to delete database. Error: ${err.message || err.name}`);
      }
    }
  }, []);

  const getPanelClasses = () => {
    switch (dbStatus) {
      case 'error': return `${panelBaseClasses} ${panelErrorClasses}`;
      case 'checking':
      case 'deleting': return `${panelBaseClasses} ${panelLoadingClasses}`;
      case 'success':
      default: return `${panelBaseClasses} ${panelSuccessClasses}`;
    }
  };

   const getBorderClasses = () => {
    switch (dbStatus) {
      case 'error': return `border-red-700`;
      case 'checking':
      case 'deleting': return `border-yellow-600`;
      case 'success':
      default: return `border-gray-700`;
    }
  };


  if (!isVisible) return null;

  const isProcessing = dbStatus === 'checking' || dbStatus === 'deleting';

  return (
    <div className={`${getPanelClasses()} ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`${panelHeaderClasses} ${getBorderClasses()}`}>
          <h3 className={panelTitleClasses}>
            {dbStatus === 'error' && <AlertCircle size={16} className="mr-1.5 text-current" />}
            {isProcessing && <RefreshCw size={16} className="mr-1.5 text-current animate-spin" />}
            {dbStatus === 'success' && <CheckCircle size={16} className="mr-1.5 text-green-400" />}
            Database Status
          </h3>
          {dbStatus === 'success' && isVisible && (
             <button onClick={() => setIsVisible(false)} className={iconButtonClasses} title="Hide Status">
               <X size={18} />
             </button>
          )}
        </div>

        <div className={panelBodyClasses}>
           <p className="break-words">{dbMessage}</p>
        </div>

        {dbStatus === 'error' && (
          <div className={`${panelFooterClasses} ${getBorderClasses()}`}>
            <button onClick={() => checkDatabaseConnection(true)} disabled={isProcessing} className={buttonRetryClasses}>
              <RefreshCw size={12} className={isProcessing ? 'animate-spin' : ''} />
              Retry
            </button>
            <button onClick={handleDeleteDatabase} disabled={isProcessing} title="Permanently delete the database" className={buttonDeleteClasses}>
              <Trash2 size={12} />
              Delete DB
            </button>
          </div>
        )}
    </div>
  );
};

export default DatabaseManager;