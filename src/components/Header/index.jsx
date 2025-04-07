// src/components/Header/index.jsx
import React, { memo } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

/**
 * Floating layout toggle button
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isHorizontal - Current layout direction
 * @param {Function} props.onToggleLayout - Layout toggle handler
 */
const Header = memo(({ isHorizontal, onToggleLayout }) => {
  return (
    <button
      onClick={onToggleLayout}
      className="absolute top-4 right-4 z-10 p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md"
      title={isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
    >
      {isHorizontal ? <ArrowDown size={20} /> : <ArrowRight size={20} />}
    </button>
  );
});

export default Header;