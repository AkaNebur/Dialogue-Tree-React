// src/components/Header/index.tsx - Removed layout toggle button
import React, { memo } from 'react';
import { Moon, Sun, Database, X } from 'lucide-react';
import OrderSelector, { OrderingStrategy } from './OrderSelector.tsx';

interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
  // Node ordering props
  orderingStrategy?: OrderingStrategy;
  onOrderChange?: (strategy: OrderingStrategy) => void;
}

/**
 * Floating header with theme toggle and data management
 * Layout toggle has been moved to NodePositioner
 */
const Header: React.FC<HeaderProps> = memo(({
  isDarkMode = false,
  onToggleTheme,
  isDataManagementVisible = false,
  onToggleDataManagement,
  orderingStrategy = 'default',
  onOrderChange
}) => {
  return (
    <div className="flex space-x-3">
      {/* Node ordering selector */}
      {onOrderChange && (
        <OrderSelector 
          currentStrategy={orderingStrategy} 
          onOrderChange={onOrderChange} 
        />
      )}
      
      {/* Theme toggle button */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className="p-3 text-white bg-purple-600 rounded-full hover:bg-purple-700 transition-colors shadow-md"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}
      
      {/* Data management toggle button */}
      {onToggleDataManagement && (
        <button
          onClick={onToggleDataManagement}
          className="p-3 text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors shadow-md"
          title={isDataManagementVisible ? 'Hide Data Management' : 'Show Data Management'}
        >
          {isDataManagementVisible ? <X size={20} /> : <Database size={20} />}
        </button>
      )}
    </div>
  );
});

export default Header;