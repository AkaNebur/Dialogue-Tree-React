// src/components/EditModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Trash2, Plus } from 'lucide-react';
import { hexToRgba } from '../utils/colorUtils';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { formStyles, alertStyles } from '../styles/commonStyles';

// --- Preset colors array ---
const PRESET_COLORS = [
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Gray', value: '#6b7280' },
];

// --- Default Color Picker Color ---
const DEFAULT_COLOR_PICKER = '#4f46e5'; // Indigo

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string, imageDataUrl?: string, newColor?: string) => void;
  onDelete?: () => void;
  title: string;
  currentName: string;
  currentImage?: string;
  currentAccentColor?: string;
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
  currentAccentColor,
  entityType,
}) => {
  const [name, setName] = useState(currentName);
  const [image, setImage] = useState<string | undefined>(currentImage);
  const [color, setColor] = useState<string>(currentAccentColor || DEFAULT_COLOR_PICKER);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [, setShowCustomColorPicker] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens or relevant props change
  useEffect(() => {
    setName(currentName);
    setImage(currentImage);
    setColor(currentAccentColor || DEFAULT_COLOR_PICKER);
    setShowDeleteConfirm(false); // Reset delete confirmation
    setShowCustomColorPicker(false); // Reset color picker state
  }, [isOpen, currentName, currentImage, currentAccentColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), image, entityType === 'NPC' ? color : undefined);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Image size exceeds 2MB limit.');
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e.target.files?.[0] || null);
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };

  const handleColorChange = (newColor: string) => {
    // Ensure color is a valid hex value
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      setColor(newColor);
    } else if (/^([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      // Add # if missing
      setColor(`#${newColor}`);
    } else {
      // If invalid, keep the current color
      console.warn('Invalid color format:', newColor);
    }
  };


  // Define modal footer with action buttons
  const modalFooter = (
    <>
      {onDelete && (
        <Button
          variant="danger"
          leftIcon={<Trash2 size={16} />}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete
        </Button>
      )}
      <div className="flex-grow"></div>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={!name.trim()}
      >
        Save Changes
      </Button>
    </>
  );

  // Image upload related classes
  const imagePlaceholderClasses = "w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center border-2 border-dashed cursor-pointer transition-colors shadow-sm";
  const imagePlaceholderStateClasses = isDraggingOver // Using dark theme styles directly
    ? "border-gray-500 bg-gray-900/30"
    : "border-gray-600 bg-gray-800 hover:border-gray-500";

  // Handle drag and drop for image upload
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
    handleImageChange(e.dataTransfer.files?.[0] || null);
  };

  // Determine if we're showing delete confirmation or edit form
  const renderContent = () => {
    if (showDeleteConfirm) {
      return (
        <div className={alertStyles.variants.error}>
          <h4 className={alertStyles.title}>Confirm Deletion</h4>
          <p className={alertStyles.message}>
            Are you sure you want to delete this {entityType.toLowerCase()}?
            {entityType === 'NPC' && " This will also delete all associated dialogues."} This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2 mt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <Input
          ref={inputRef}
          label={`${entityType} Name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${entityType.toLowerCase()} name`}
          required
        />

        {/* NPC-specific fields */}
        {entityType === 'NPC' && (
          <>
            {/* Image Upload Section */}
            <div className={formStyles.group}>
              <label className={formStyles.label}>
                Profile Image (Optional)
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/png, image/jpeg, image/gif"
                className="hidden"
                aria-label="Upload profile image"
              />

              <div className="flex items-center space-x-4">
                {/* Image Preview / Placeholder */}
                <div
                  className={`${imagePlaceholderClasses} ${imagePlaceholderStateClasses}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  aria-label="Image upload area"
                  title="Click or drag image (Max 2MB)"
                >
                  {image ? (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img
                        src={image}
                        alt="NPC Profile Preview"
                        className="w-full h-full object-cover rounded-full border border-gray-600 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-1 ring-offset-1 ring-red-600"
                        title="Remove image"
                        aria-label="Remove profile image"
                      >
                        <span className="sr-only">Remove image</span>
                        ×
                      </button>
                    </div>
                  ) : (
                    <User size={24} className="text-gray-500" aria-hidden="true" />
                  )}
                </div>

                {/* Upload/Change Button */}
                <Button
                  variant="ghost"
                  leftIcon={<Camera size={14} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
              <p className={formStyles.helpText}>Max 2MB. PNG, JPG, GIF.</p>
            </div>

            {/* Accent Color Section */}
            <div className={formStyles.group}>
              <label className={formStyles.label}>Accent Color</label>
              
              {/* Preset Colors */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Preset Colors</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color.toLowerCase() === presetColor.value.toLowerCase()
                          ? 'border-gray-300 ring-2 ring-offset-2 ring-gray-400 ring-offset-gray-800'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: presetColor.value }}
                      title={presetColor.label}
                      onClick={() => handleColorChange(presetColor.value)}
                      aria-label={`Select ${presetColor.label} color`}
                    />
                  ))}
                    {/* Custom color button - with positioned color input */}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-gray-500 bg-gray-700 relative"
                      title="Custom Color"
                    >
                      <Plus size={16} className="text-gray-300" />
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        onInput={(e) => handleColorChange((e.target as HTMLInputElement).value)}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        aria-label="Select custom color"
                      />
                    </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className={formStyles.group}>
              <label className={formStyles.label}>Preview</label>
              <div
                className="relative rounded-lg overflow-hidden flex h-12 border-2 items-center transition-all duration-200 px-3"
                style={{
                  borderColor: color,
                  backgroundColor: hexToRgba(color, 0.2) // 20% opacity background using our utility
                }}
                aria-label="NPC card preview"
              >
                {/* Preview Avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 flex-shrink-0 mr-3">
                  {image ? (
                    <img
                      src={image}
                      alt="NPC Preview Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User size={16} className="text-gray-500" aria-hidden="true" />
                  )}
                </div>
                {/* Preview Name */}
                <span className="text-sm font-medium truncate text-white">
  {name.trim() || "NPC Name"}
</span>
              </div>
            </div>
          </>
        )}
      </form>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={!showDeleteConfirm ? modalFooter : undefined}
    >
      {renderContent()}
    </Modal>
  );
};

export default EditModal;