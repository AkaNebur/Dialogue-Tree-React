// File: src/components/InfoModal/index.tsx

import React from 'react';
import Modal from '../ui/Modal';
import {
  MousePointer2, ZoomIn, ZoomOut, Maximize2, Trash2, GitFork, Move, Spline, Plus, Command, ArrowBigUp
} from 'lucide-react';

// Styled components for info modal sections
interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div>
    <h4 className={`text-base font-semibold text-gray-200 mb-3 flex items-center gap-2 border-b border-[var(--color-border)] pb-1.5`}>
      {icon} {title}
    </h4>
    <div className="space-y-2">{children}</div>
  </div>
);

interface ShortcutProps {
  icon: React.ReactNode;
  action: string;
  description: React.ReactNode;
}

const Shortcut: React.FC<ShortcutProps> = ({ icon, action, description }) => (
  <div className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-100 hover:bg-[var(--color-bg)] transition-colors">
    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5 text-gray-400">
      {icon}
    </div>
    <div className="flex-grow">
      <p className="font-medium text-gray-200">{action}</p>
      <p className="text-gray-400">{description}</p>
    </div>
  </div>
);

const KeyName: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 mx-0.5">
    {children}
  </kbd>
);

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Shortcuts"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        <Section title="Canvas Navigation" icon={<Move size={18} />}>
          <Shortcut icon={<MousePointer2 size={16} />} action="Pan Canvas" description="Click and drag on an empty area of the canvas." />
          <Shortcut icon={<ZoomIn size={16} className="text-green-400" />} action="Zoom In" description="Use the scroll wheel upwards or pinch-out gesture." />
          <Shortcut icon={<ZoomOut size={16} className="text-red-400" />} action="Zoom Out" description="Use the scroll wheel downwards or pinch-in gesture." />
          <Shortcut icon={<Maximize2 size={16} className="text-purple-400" />} action="Fit View" description="Click the Fit View button in controls or Layout Options." />
        </Section>

        <Section title="Node & Edge Interaction" icon={<Spline size={18} />}>
          <Shortcut icon={<MousePointer2 size={16} />} action="Select Node/Edge" description="Click on a node or an edge." />
          <Shortcut icon={<Plus size={16} className="text-indigo-600 dark:text-indigo-400" />} action="Multi-Select" description={<span>Hold <KeyName><ArrowBigUp size={12} className="inline-block -mt-px" /></KeyName> and click, or drag a selection box.</span>} />
          <Shortcut icon={<MousePointer2 size={16} />} action="Move Node" description="Click and drag a selected node." />
          <Shortcut icon={<Spline size={16} className="text-orange-500 dark:text-orange-400" />} action="Connect Nodes" description="Drag from a source handle to a target handle." />
          <Shortcut icon={<Spline size={16} className="text-teal-400" />} action="Create Node & Connect" description="Drag from a source handle and release on empty canvas area." />
          <Shortcut
            icon={<Trash2 size={16} className="text-red-400" />}
            action="Delete Selected"
            description={<span>Press <KeyName>Delete</KeyName> or <KeyName>Del</KeyName> key.</span>}
          />
        </Section>

        <Section title="Layout & Management" icon={<GitFork size={18} />}>
          <Shortcut icon={<GitFork size={16} className="text-yellow-600 dark:text-yellow-400" />} action="Smart Layout" description="Click 'Layout Options' -> 'Smart Layout' to auto-arrange nodes." />
          <Shortcut icon={<GitFork size={16} className="text-yellow-400" />} action="Change Direction" description="Use Horizontal/Vertical buttons in 'Layout Options'." />
        </Section>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
          Note: Key names like <KeyName><Command size={12} className="inline-block -mt-px" /></KeyName> (Mac) or <KeyName>Ctrl</KeyName> (Win/Linux) may vary by OS.
        </p>
      </div>
    </Modal>
  );
};

export default InfoModal;