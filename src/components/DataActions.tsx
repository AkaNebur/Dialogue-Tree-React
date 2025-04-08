// src/components/DataActions.tsx
import React, { useState } from 'react';
import { exportDialogueData, importDialogueData } from '../services/dialogueService';

interface DataActionsProps {
  onDataImported: () => void;
}

/**
 * Component for importing and exporting dialogue data
 */
const DataActions: React.FC<DataActionsProps> = ({ onDataImported }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Handle data export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setImportError(null);
      
      // Get JSON data from service
      const jsonData = await exportDialogueData();
      
      // Create file for download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create and click download link
      const link = document.createElement('a');
      const fileName = `dialogue-builder-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Exported dialogue data to ${fileName}`);
    } catch (error) {
      console.error('Export failed:', error);
      setImportError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle data import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      // Read file contents
      const fileContent = await file.text();
      
      // Attempt to import the data
      const success = await importDialogueData(fileContent);
      
      if (success) {
        console.log('Data imported successfully');
        onDataImported();
      } else {
        setImportError('Invalid data format. Please check your JSON file.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError('Failed to import data');
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };
  
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-3 flex flex-col gap-2">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Data Management</h3>
      
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      >
        {isExporting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Data</span>
          </>
        )}
      </button>
      
      {/* Import Button */}
      <label className={`flex items-center gap-2 px-3 py-2 rounded-md shadow-md cursor-pointer ${
        isImporting 
          ? 'bg-green-400 text-white' 
          : 'bg-green-600 text-white hover:bg-green-700'
      } transition-colors`}>
        {isImporting ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Importing...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import Data</span>
          </>
        )}
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={isImporting}
          className="hidden"
        />
      </label>
      
      {/* Error Message */}
      {importError && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-xs">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{importError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataActions;