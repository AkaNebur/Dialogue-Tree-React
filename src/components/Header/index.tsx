// src/components/Header/index.tsx
import React, { memo } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { HeaderProps } from '../../types';

/**
 * Floating layout toggle button
 */
const Header: React.FC<HeaderProps> = memo(({ isHorizontal, onToggleLayout, onFitView }) => {
  // Combined handler to toggle layout and then fit view
  const handleToggleAndFit = () => {
    onToggleLayout(); // First toggle the layout
    
    // Only call fitView if provided
    if (onFitView) {
      // Add a small delay to ensure layout is applied first
      setTimeout(() => {
        onFitView();
      }, 100);
    }
  };

  return (
    <button
      onClick={handleToggleAndFit}
      className="absolute top-4 right-4 z-10 p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md"
      title={isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
    >
      {isHorizontal ? <ArrowDown size={20} /> : <ArrowRight size={20} />}
    </button>
  );
});

export default Header;