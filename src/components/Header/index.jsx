import React, { memo } from 'react';

/**
 * Header component with title, subtitle and layout control
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isHorizontal - Current layout direction
 * @param {Function} props.onToggleLayout - Layout toggle handler
 */
const Header = ({ isHorizontal, onToggleLayout }) => {
  return (
    <div className="absolute top-0 left-0 z-10 p-4 m-4 bg-white bg-opacity-90 rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-gray-800">Dialogue Tree Builder</h1>
      <p className="text-sm text-gray-600 mb-4">
        Create and visualize dialogue trees for your game or application
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onToggleLayout}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
        </button>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Header);