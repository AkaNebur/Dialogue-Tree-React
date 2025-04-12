import React from 'react';
import {
  X, MousePointer2, ZoomIn, ZoomOut, Maximize2, Trash2, GitFork, Move, Spline, Plus, Command, ArrowBigUp
} from 'lucide-react';

// --- Consistent Style Definitions ---
const modalBackdropClasses = "fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm";
const modalContentClasses = "bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-200";
const modalHeaderClasses = "flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0";
const modalTitleClasses = "text-lg font-semibold text-gray-800 dark:text-gray-100";
const modalBodyClasses = "p-5 overflow-y-auto card-scrollbar space-y-5 text-sm"; // Uses card-scrollbar

const modalCloseButtonClasses = "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"; // Neutral focus ring

const sectionTitleClasses = "text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-dark-border pb-1.5";
const shortcutItemClasses = "flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors";
const shortcutIconClasses = "flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 text-gray-600 dark:text-gray-400";
const shortcutActionClasses = "font-medium text-gray-800 dark:text-gray-200";
const shortcutDescClasses = "text-gray-600 dark:text-gray-400";
const keyNameClasses = "px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 mx-0.5";
// --- End Style Definitions ---

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className={modalBackdropClasses} onClick={onClose}>
        <div className={modalContentClasses} onClick={e => e.stopPropagation()}>
          <div className={modalHeaderClasses}>
            <h3 className={modalTitleClasses}> Help & Shortcuts </h3>
            <button type="button" onClick={onClose} className={modalCloseButtonClasses} title="Close">
              <X size={24} />
            </button>
          </div>

          <div className={modalBodyClasses}>
            <Section title="Canvas Navigation" icon={<Move size={18} />}>
              <Shortcut icon={<MousePointer2 size={16} />} action="Pan Canvas" description="Click and drag on an empty area of the canvas." />
              <Shortcut icon={<ZoomIn size={16} className="text-green-600 dark:text-green-400" />} action="Zoom In" description="Use the scroll wheel upwards or pinch-out gesture." />
              <Shortcut icon={<ZoomOut size={16} className="text-red-600 dark:text-red-400" />} action="Zoom Out" description="Use the scroll wheel downwards or pinch-in gesture." />
              <Shortcut icon={<Maximize2 size={16} className="text-purple-600 dark:text-purple-400" />} action="Fit View" description="Click the Fit View button in controls or Layout Options." />
            </Section>

            <Section title="Node & Edge Interaction" icon={<Spline size={18} />}>
              <Shortcut icon={<MousePointer2 size={16} />} action="Select Node/Edge" description="Click on a node or an edge." />
              <Shortcut icon={<Plus size={16} className="text-indigo-600 dark:text-indigo-400" />} action="Multi-Select" description={<span>Hold <KeyName><ArrowBigUp size={12} className="inline-block -mt-px" /></KeyName> and click, or drag a selection box.</span>} />
              <Shortcut icon={<MousePointer2 size={16} />} action="Move Node" description="Click and drag a selected node." />
              <Shortcut icon={<Spline size={16} className="text-orange-500 dark:text-orange-400" />} action="Connect Nodes" description="Drag from a source handle to a target handle." />
              <Shortcut icon={<Spline size={16} className="text-teal-500 dark:text-teal-400" />} action="Create Node & Connect" description="Drag from a source handle and release on empty canvas area." />
              <Shortcut 
                icon={<Trash2 size={16} className="text-red-500 dark:text-red-400" />} 
                action="Delete Selected" 
                description={<span>Press <KeyName>Backspace</KeyName>, <KeyName>Delete</KeyName>, or <KeyName>Del</KeyName> key.</span>} 
              />
            </Section>

            <Section title="Layout & Management" icon={<GitFork size={18} />}>
                <Shortcut icon={<GitFork size={16} className="text-yellow-600 dark:text-yellow-400" />} action="Smart Layout" description="Click 'Layout Options' -> 'Smart Layout' to auto-arrange nodes." />
                <Shortcut icon={<GitFork size={16} className="text-yellow-600 dark:text-yellow-400" />} action="Change Direction" description="Use Horizontal/Vertical buttons in 'Layout Options'." />
            </Section>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
              Note: Key names like <KeyName><Command size={12} className="inline-block -mt-px" /></KeyName> or <KeyName>Ctrl</KeyName> may vary by OS.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

interface SectionProps { title: string; icon?: React.ReactNode; children: React.ReactNode; }
const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div>
    <h4 className={sectionTitleClasses}> {icon} {title} </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

interface ShortcutProps { icon: React.ReactNode; action: string; description: React.ReactNode; }
const Shortcut: React.FC<ShortcutProps> = ({ icon, action, description }) => (
  <div className={shortcutItemClasses}>
    <div className={shortcutIconClasses}>{icon}</div>
    <div className="flex-grow">
      <p className={shortcutActionClasses}>{action}</p>
      <p className={shortcutDescClasses}>{description}</p>
    </div>
  </div>
);

const KeyName: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className={keyNameClasses}> {children} </kbd>
);

export default InfoModal;