import React, { memo } from 'react';

/**
 * Header component with title, subtitle and layout control
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isHorizontal - Current layout direction
 * @param {Function} props.onToggleLayout - Layout toggle handler
 */
const Header = memo(({ isHorizontal, onToggleLayout }) => { // Use memo
  return (
    // Use the updated class name from CSS
    <div className="header-container">
      <h1 className="text-xl font-bold text-gray-800">Dialogue Tree Builder</h1>
      <p className="text-sm text-gray-600 mb-4">
        Select NPCs and Conversations in the sidebar.
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onToggleLayout}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
        </button>
        {/* Removed Auto Layout Button - it now runs on toggle or initial load */}
      </div>
    </div>
  );
});

// Memoize the component
export default Header; // Ensure export default memo works or export default memo(Header)