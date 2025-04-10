// src/components/DataActions.tsx
import React, { useState } from 'react';
import { exportDialogueData, importDialogueData } from '../services/dialogueService';
import { Download, Upload, AlertTriangle } from 'lucide-react';

interface DataActionsProps {
  onDataImported: () => void;
}

/**
 * Component for importing and exporting dialogue data
 * Styled to match the NodePositioner component
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
    <div className="w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden border-2 border-blue-100 dark:border-dark-border transition-colors duration-300">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
          Data Management
        </h3>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-dark-border">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
          Import/Export
        </h4>
        <div className="space-y-2">
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 px-4 flex items-center gap-2 bg-blue-50 hover:bg-blue-100 
                    dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 
                    rounded-md transition-colors"
          >
            <Download size={18} />
            <div className="text-left flex-grow">
              <div className="font-medium">{isExporting ? 'Exporting...' : 'Export Data'}</div>
              <div className="text-xs text-blue-600 dark:text-blue-300">Save all dialogues as JSON</div>
            </div>
            {isExporting && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
            )}
          </button>
          
          {/* Import Button */}
          <label className="w-full py-3 px-4 flex items-center gap-2 bg-green-50 hover:bg-green-100 
                          dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 
                          rounded-md transition-colors cursor-pointer">
            <Upload size={18} />
            <div className="text-left flex-grow">
              <div className="font-medium">{isImporting ? 'Importing...' : 'Import Data'}</div>
              <div className="text-xs text-green-600 dark:text-green-300">Load dialogues from file</div>
            </div>
            {isImporting && (
              <div className="animate-spin h-4 w-4 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full"></div>
            )}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      {/* Error Message */}
      {importError && (
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3 border border-red-200 dark:border-red-900/60">
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm text-red-800 dark:text-red-200">{importError}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataActions;