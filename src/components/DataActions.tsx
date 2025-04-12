// src/components/DataActions.tsx - Updated with new UI components
import React, { useState, useRef } from 'react';
import { exportDialogueData, importDialogueData } from '../services/dialogueService';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import Panel from './ui/Panel';
import Button from './ui/Button';
import { alertStyles } from '../styles/commonStyles';

interface DataActionsProps {
  onDataImported: () => void;
}

const DataActions: React.FC<DataActionsProps> = ({ onDataImported }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isLoading = isExporting || isImporting;

  return (
    <Panel 
      title="Data Management" 
      variant="sidebar"
    >
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Import / Export
          </h4>
          <div className="space-y-2">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Download size={18} />}
              onClick={handleExport}
              disabled={isLoading}
              isLoading={isExporting}
            >
              <div className="text-left flex-grow">
                <div className="font-medium">Export Data</div>
                <div className="text-xs opacity-80">Save all dialogues as JSON</div>
              </div>
            </Button>

            <Button
              variant="secondary"
              fullWidth
              leftIcon={<Upload size={18} />}
              onClick={triggerFileInput}
              disabled={isLoading}
              isLoading={isImporting}
            >
              <div className="text-left flex-grow">
                <div className="font-medium">Import Data</div>
                <div className="text-xs opacity-80">Load dialogues from file</div>
              </div>
            </Button>
            
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              disabled={isLoading} 
              className="hidden" 
              ref={fileInputRef}
            />
          </div>
        </div>

        {(importError || exportError) && (
          <div className={alertStyles.variants.error}>
            <div className="flex items-start">
              <AlertTriangle size={16} className="flex-shrink-0 mr-2 text-red-500" />
              <span className="text-sm">{importError || exportError}</span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default DataActions;