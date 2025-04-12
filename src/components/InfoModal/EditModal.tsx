import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, X, Trash2 } from 'lucide-react';

// --- Consistent Style Definitions ---
const modalBackdropClasses = "fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm";
const modalContentClasses = "bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md overflow-hidden relative transition-colors duration-200";
const modalHeaderClasses = "bg-blue-600 dark:bg-blue-700 text-white px-5 py-4";
const modalTitleClasses = "text-lg font-medium";
const modalBodyClasses = "p-5";
const modalFooterClasses = "px-5 py-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border flex justify-between items-center";

const labelBaseClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
const inputBaseClasses = "w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-sm";

const buttonBaseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
const buttonPrimaryClasses = `${buttonBaseClasses} text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500`;
const buttonSecondaryClasses = `${buttonBaseClasses} text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-indigo-500`;
const buttonDestructiveClasses = `${buttonBaseClasses} text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500`;
const buttonTextClasses = "inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-400 rounded";

const modalCloseButtonClasses = "absolute top-3 right-3 text-gray-200 hover:text-white dark:text-gray-400 dark:hover:text-gray-100 p-1 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-white";
// --- End Style Definitions ---

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string, imageDataUrl?: string) => void;
  onDelete?: () => void;
  title: string;
  currentName: string;
  currentImage?: string;
  entityType: 'NPC' | 'Dialogue';
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  title,
  currentName,
  currentImage,
  entityType,
}) => {
  const [name, setName] = useState(currentName);
  const [image, setImage] = useState<string | undefined>(currentImage);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setImage(currentImage);
      setShowDeleteConfirm(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentName, currentImage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), image);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
        alert(file?.size > 2 * 1024 * 1024 ? 'Image size exceeds 2MB limit.' : 'Please upload a valid image file.');
        e.target.value = ''; // Reset file input
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const confirmDelete = () => onDelete?.();
  const cancelDelete = () => setShowDeleteConfirm(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingOver(true); };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
     if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
        alert(file?.size > 2 * 1024 * 1024 ? 'Image size exceeds 2MB limit.' : 'Please upload a valid image file.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={modalBackdropClasses} onClick={onClose}>
        <div className={modalContentClasses} onClick={e => e.stopPropagation()}>
          <button type="button" onClick={onClose} className={modalCloseButtonClasses} title="Close">
            <X size={24} />
          </button>

          <div className={modalHeaderClasses}>
             <h3 className={`${modalTitleClasses} pr-8`}>{title}</h3>
          </div>

          {showDeleteConfirm ? (
            <div className={modalBodyClasses}>
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md border border-red-200 dark:border-red-800">
                <h4 className="text-red-800 dark:text-red-200 font-semibold text-base mb-2">Confirm Deletion</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Are you sure you want to delete this {entityType.toLowerCase()}?
                  {entityType === 'NPC' && " This will also delete all associated dialogues."}
                </p>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={cancelDelete} className={buttonSecondaryClasses}> Cancel </button>
                  <button type="button" onClick={confirmDelete} className={buttonDestructiveClasses}> Delete </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={modalBodyClasses}>
                <div className="mb-4">
                  <label htmlFor="edit-name" className={labelBaseClasses}> {entityType} Name </label>
                  <input ref={inputRef} type="text" id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className={inputBaseClasses} placeholder={`Enter ${entityType.toLowerCase()} name`} />
                </div>

                {entityType === 'NPC' && (
                  <div className="mb-4">
                    <label className={labelBaseClasses}> Profile Image </label>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                    {image ? (
                      <div className="relative w-28 h-28 mx-auto mb-2">
                        <img src={image} alt="NPC Profile" className="w-full h-full object-cover rounded-full border-2 border-blue-400 dark:border-blue-500" />
                        <button type="button" onClick={handleRemoveImage} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" title="Remove image"> <X size={14} /> </button>
                      </div>
                    ) : (
                      <div
                        className={`w-28 h-28 mx-auto mb-2 rounded-full flex flex-col items-center justify-center border-2 border-dashed cursor-pointer transition-colors ${ isDraggingOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500'}`}
                        onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      >
                        <User size={36} className="text-gray-400 dark:text-gray-500 mb-1" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2"> {isDraggingOver ? 'Drop image' : 'Click or drag'} </span>
                      </div>
                    )}

                    <div className="text-center mt-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonTextClasses} >
                        <Camera size={14} className="mr-1" />
                        {image ? 'Change Image' : 'Upload Image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={modalFooterClasses}>
                 <div>
                  {onDelete && (
                    <button type="button" onClick={handleDeleteClick} className={`${buttonDestructiveClasses} px-3 py-1.5`} title={`Delete this ${entityType}`} >
                       <Trash2 size={16} className="mr-1.5" /> Delete
                    </button>
                  )}
                 </div>
                 <div className="flex space-x-3">
                  <button type="button" onClick={onClose} className={buttonSecondaryClasses}> Cancel </button>
                  <button type="submit" className={buttonPrimaryClasses}> Save Changes </button>
                 </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default EditModal;