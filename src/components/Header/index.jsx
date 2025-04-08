// src/components/Header/index.jsx
import React, { memo } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

/**
 * Floating layout toggle button
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isHorizontal - Current layout direction
 * @param {Function} props.onToggleLayout - Layout toggle handler
 * @param {Function} props.onFitView - Function to fit view after layout change
 */
const Header = memo(({ isHorizontal, onToggleLayout, onFitView }) => {
  // Combined handler to toggle layout and then fit view
  const handleToggleAndFit = () => {
    onToggleLayout(); // First toggle the layout
    
    // We don't need to explicitly call fitView here as it's now 
    // handled in the layout effect in DialogueFlow, but we could
    // if we wanted an additional trigger
    if (onFitView) {
      // Optional: Add a small delay to ensure layout is applied first
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