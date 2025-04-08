// src/components/Header/index.tsx
import React, { memo } from 'react';
import { ArrowDown, ArrowRight, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  isHorizontal: boolean;
  onToggleLayout: () => void;
  onFitView?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

/**
 * Floating layout toggle button and theme toggle
 */
const Header: React.FC<HeaderProps> = memo(({
  isHorizontal,
  onToggleLayout,
  onFitView,
  isDarkMode = false,
  onToggleTheme
}) => {
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
    <div className="flex space-x-3">
      <button
        onClick={handleToggleAndFit}
        className="p-3 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-md"
        title={isHorizontal ? 'Switch to Vertical Layout' : 'Switch to Horizontal Layout'}
      >
        {isHorizontal ? <ArrowDown size={20} /> : <ArrowRight size={20} />}
      </button>
      
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className="p-3 text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-md"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}
    </div>
  );
});

export default Header;