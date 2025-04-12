// File: src/components/ui/Modal.tsx

// src/components/ui/Modal.tsx
import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { modalStyles, typography } from '../../styles/commonStyles';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  initialFocusRef,
}) => {
  // Don't render anything if the modal is closed
  if (!isOpen) return null;

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);

      // Focus the initial element if provided
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      }

      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEsc, initialFocusRef]);

  // Determine max-width class
  const widthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  // Update content class with the appropriate max-width
  const contentClass = `${modalStyles.content} ${widthClass}`;

  // Create portal to render modal at the document body level
  return createPortal(
    <div
      className={modalStyles.backdrop}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={contentClass} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={modalStyles.closeButton}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div className={modalStyles.header}>
          <h2 id="modal-title" className={typography.heading.lg}>{title}</h2>
        </div>

        {/* Modal Body */}
        <div className={modalStyles.body}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--color-border)] flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;