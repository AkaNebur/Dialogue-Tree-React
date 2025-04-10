// src/components/EditModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string, imageDataUrl?: string) => void;
  title: string;
  currentName: string;
  currentImage?: string;
  entityType: 'NPC' | 'Dialogue';
}

/**
 * Modal component for editing names and images
 */
const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  currentName,
  currentImage,
  entityType,
}) => {
  const [name, setName] = useState(currentName);
  const [image, setImage] = useState<string | undefined>(currentImage);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset state when modal opens with new entity
  useEffect(() => {
    setName(currentName);
    setImage(currentImage);
    
    // Focus input when modal opens
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentName, currentImage]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name isn't empty
    if (name.trim()) {
      onSave(name.trim(), image);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setImage(undefined);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle drag events for image upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full overflow-hidden transition-colors duration-200"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking the modal itself
        >
          {/* Modal Header */}
          <div className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-3">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
          
          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="p-4">
            <div className="mb-4">
              <label 
                htmlFor="edit-name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {entityType} Name
              </label>
              <input
                ref={inputRef}
                type="text"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 border rounded-md 
                         border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${entityType.toLowerCase()} name`}
              />
            </div>
            
            {/* Image Upload Section - Only for NPCs */}
            {entityType === 'NPC' && (
              <div className="mb-4">
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Profile Image
                </label>
                
                {/* Hidden file input */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Image Preview or Upload Area */}
                {image ? (
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <img 
                      src={image} 
                      alt="NPC Profile" 
                      className="w-full h-full object-cover rounded-full border-2 border-blue-500 dark:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`w-32 h-32 mx-auto mb-2 rounded-full flex flex-col items-center justify-center 
                              border-2 border-dashed cursor-pointer transition-colors
                              ${isDraggingOver 
                                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30' 
                                : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <User size={40} className="text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {isDraggingOver ? 'Drop image here' : 'Click or drag image'}
                    </span>
                  </div>
                )}
                
                {/* Upload Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 
                             dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Camera size={14} className="mr-1" />
                    {image ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                        bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                        rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white 
                        bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 
                        rounded-md transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditModal;