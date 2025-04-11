// src/components/InfoModal/index.tsx
import React from 'react';
import {
  X,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  GitFork,
  Move,
  Spline,
  Plus // Used for multi-select indicator
} from 'lucide-react'; // Corrected imports

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal component displaying help information and shortcuts.
 * Rendered at the App level for correct z-index stacking.
 */
const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-50 flex items-center justify-center p-4" // Ensure z-50 for stacking
        onClick={onClose} // Close when clicking backdrop
      >
        {/* Modal Content */}
        <div
          className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-200"
          onClick={e => e.stopPropagation()} // Prevent closing when clicking the modal itself
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Help & Shortcuts
            </h3>
            <button
              type="button"
              onClick={onClose} // Use the onClose prop passed from App
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="p-5 overflow-y-auto card-scrollbar space-y-5 text-sm">
            <Section title="Canvas Navigation" icon={<Move size={18} />}>
              <Shortcut
                icon={<MousePointer2 size={16} className="text-blue-600 dark:text-blue-400" />}
                action="Pan Canvas"
                description="Click and drag on an empty area of the canvas."
              />
              <Shortcut
                icon={<ZoomIn size={16} className="text-green-600 dark:text-green-400" />}
                action="Zoom In"
                description="Use the scroll wheel upwards or pinch-out gesture on touchpads."
              />
              <Shortcut
                icon={<ZoomOut size={16} className="text-red-600 dark:text-red-400" />}
                action="Zoom Out"
                description="Use the scroll wheel downwards or pinch-in gesture on touchpads."
              />
              <Shortcut
                icon={<Maximize2 size={16} className="text-purple-600 dark:text-purple-400" />}
                action="Fit View"
                description="Click the Fit View button (usually part of zoom controls) or use the button in Layout Options."
              />
            </Section>

            <Section title="Node & Edge Interaction" icon={<Spline size={18} />}>
              <Shortcut
                icon={<MousePointer2 size={16} />}
                action="Select Node/Edge"
                description="Click on a node or an edge."
              />
              <Shortcut
                icon={<Plus size={16} className="text-indigo-600 dark:text-indigo-400"/>} // Used Plus icon here
                action="Multi-Select"
                description={<span>Hold <KeyName>Shift</KeyName> and click multiple nodes/edges, or click and drag on the canvas to draw a selection box.</span>}
              />
               <Shortcut
                icon={<MousePointer2 size={16} />}
                action="Move Node"
                description="Click and drag a selected node."
               />
              <Shortcut
                icon={<Spline size={16} className="text-orange-500 dark:text-orange-400" />}
                action="Connect Nodes"
                description="Click and drag from a source handle (right/bottom) of one node to a target handle (left/top) of another."
              />
               <Shortcut
                icon={<Spline size={16} className="text-teal-500 dark:text-teal-400" />}
                action="Create Node & Connect"
                description="Click and drag from a source handle and release the mouse button over an empty area of the canvas. A new node will be created and connected automatically."
              />
              <Shortcut
                icon={<Trash2 size={16} className="text-red-500 dark:text-red-400" />}
                action="Delete Selected"
                description={<span>Press <KeyName>Backspace</KeyName> or <KeyName>Delete</KeyName> key when nodes or edges are selected.</span>}
              />
            </Section>

            <Section title="Layout & Management" icon={<GitFork size={18} />}>
                <Shortcut
                    icon={<GitFork size={16} className="text-yellow-600 dark:text-yellow-400" />}
                    action="Smart Layout"
                    description="Click the 'Layout Options' button (fork icon) and then 'Smart Layout' to automatically arrange nodes using Dagre."
                />
                 <Shortcut
                    icon={<GitFork size={16} className="text-yellow-600 dark:text-yellow-400" />}
                    action="Change Direction"
                    description="Use the Horizontal/Vertical buttons within 'Layout Options' to change the flow direction."
                />
            </Section>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
              Note: Specific keyboard shortcuts might vary slightly based on your operating system and browser.
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

// Helper component for consistent section styling
interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div>
    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2 border-b border-gray-200 dark:border-dark-border pb-1.5">
      {icon}
      {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

// Helper component for consistent shortcut item styling
interface ShortcutProps {
  icon: React.ReactNode;
  action: string;
  description: React.ReactNode;
}
const Shortcut: React.FC<ShortcutProps> = ({ icon, action, description }) => (
  <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 text-gray-600 dark:text-gray-400">{icon}</div>
    <div className="flex-grow">
      <p className="font-medium text-gray-800 dark:text-gray-200">{action}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

// Helper for key names
const KeyName: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 mx-0.5">
    {children}
  </kbd>
);


export default InfoModal;