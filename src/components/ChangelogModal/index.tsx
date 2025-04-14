// src/components/ChangelogModal/index.tsx
// *** MODIFIED ***
import React from 'react';
import { ExternalLink } from 'lucide-react';
import Modal, { ModalProps } from '../ui/Modal';
import Button from '../ui/Button';
import MarkdownRenderer from '../Markdown/MarkdownRenderer';

interface ChangelogModalProps extends Omit<ModalProps, 'title' | 'children'> {
  changelogContent: string;
  roadmapUrl: string;
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  changelogContent,
  roadmapUrl,
  ...modalProps // Pass other modal props like maxWidth etc.
}) => {

  const modalFooter = (
    <a
      href={roadmapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block" // Make the anchor behave like a block for styling
    >
      <Button
        variant="secondary" // Or primary, depending on desired style
        leftIcon={<ExternalLink size={16} />}
        // Use onClick={(e) => e.stopPropagation()} if needed inside the modal click handler
      >
        View Full Roadmap (Notion)
      </Button>
    </a>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changelog & Roadmap Info"
      footer={modalFooter}
      maxWidth="2xl" // Adjust size as needed
      {...modalProps}
    >
      {/* Remove prose classes from here, they are now inside MarkdownRenderer */}
      <div className="max-h-[60vh] overflow-y-auto card-scrollbar pr-2">
        <MarkdownRenderer markdown={changelogContent} />
      </div>
    </Modal>
  );
};

export default ChangelogModal;