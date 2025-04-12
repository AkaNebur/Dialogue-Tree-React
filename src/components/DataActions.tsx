import React, { useState } from 'react';
import { exportDialogueData, importDialogueData } from '../services/dialogueService';
import { Download, Upload, AlertTriangle, Loader2 } from 'lucide-react'; // Added Loader2

// --- Consistent Style Definitions ---
const panelBaseClasses = "w-64 bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden border-2 border-blue-100 dark:border-dark-border transition-colors duration-300";
const panelHeaderClasses = "p-4 border-b border-gray-200 dark:border-dark-border";
const panelTitleClasses = "text-md font-semibold text-gray-700 dark:text-gray-300";
const panelBodyClasses = "p-4";
const sectionTitleClasses = "text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide"; // Made slightly bolder

const buttonBaseClasses = "w-full py-3 px-4 flex items-center gap-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"; // Added gap-3
const buttonExportClasses = `${buttonBaseClasses} bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-200 focus:ring-blue-400`;
const buttonImportClasses = `${buttonBaseClasses} bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200 focus:ring-green-400 cursor-pointer`; // Added cursor-pointer for label
const buttonDisabledClasses = "opacity-70 cursor-not-allowed";

const alertBoxClasses = "rounded-md p-3 border";
const alertErrorClasses = `${alertBoxClasses} bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-900/60`;
const alertErrorTextClasses = "text-sm text-red-800 dark:text-red-200";
const alertIconClasses = "mr-2 flex-shrink-0"; // Consistent icon spacing
// --- End Style Definitions ---


interface DataActionsProps {
  onDataImported: () => void;
}

const DataActions: React.FC<DataActionsProps> = ({ onDataImported }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null); // Added export error

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setImportError(null);
    try {
      const jsonData = await exportDialogueData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dialogue-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Failed to export data. See console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setExportError(null);
    try {
      const fileContent = await file.text();
      const success = await importDialogueData(fileContent);
      if (success) {
        onDataImported(); // Reload data in App
      } else {
        setImportError('Invalid data format or structure. Please check the JSON file.');
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportError('Failed to read or process the file. See console for details.');
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  const isLoading = isExporting || isImporting;

  return (
    <div className={panelBaseClasses}>
      <div className={panelHeaderClasses}>
        <h3 className={panelTitleClasses}> Data Management </h3>
      </div>

      <div className={`${panelBodyClasses} border-b border-gray-200 dark:border-dark-border`}>
        <h4 className={sectionTitleClasses}> Import / Export </h4>
        <div className="space-y-2">
          <button
            onClick={handleExport}
            disabled={isLoading}
            className={`${buttonExportClasses} ${isLoading ? buttonDisabledClasses : ''}`}
          >
            <Download size={18} />
            <div className="text-left flex-grow">
              <div className="font-medium">{isExporting ? 'Exporting...' : 'Export Data'}</div>
              <div className="text-xs opacity-80">Save all dialogues as JSON</div>
            </div>
            {isExporting && <Loader2 size={16} className="animate-spin" />}
          </button>

          <label className={`${buttonImportClasses} ${isLoading ? buttonDisabledClasses : ''}`}>
            <Upload size={18} />
            <div className="text-left flex-grow">
              <div className="font-medium">{isImporting ? 'Importing...' : 'Import Data'}</div>
              <div className="text-xs opacity-80">Load dialogues from file</div>
            </div>
             {isImporting && <Loader2 size={16} className="animate-spin" />}
            <input type="file" accept=".json" onChange={handleImport} disabled={isLoading} className="hidden" />
          </label>
        </div>
      </div>

      {(importError || exportError) && (
        <div className={panelBodyClasses}>
          <div className={alertErrorClasses}>
            <div className="flex items-start"> {/* Use items-start for better alignment */}
              <AlertTriangle size={16} className={`${alertIconClasses} text-red-500`} />
              <span className={alertErrorTextClasses}>{importError || exportError}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataActions;