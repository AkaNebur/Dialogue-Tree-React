import React, { memo } from 'react';
import { Moon, Sun, Database, X } from 'lucide-react';

interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
}

/**
 * Floating header with theme toggle and data management
 */
const Header: React.FC<HeaderProps> = memo(({
  isDarkMode = false,
  onToggleTheme,
  isDataManagementVisible = false,
  onToggleDataManagement,
}) => {
  // Define the common style matching CardSidebar top buttons
  const commonButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border";

  return (
    <div className="flex space-x-3">
      {/* Theme toggle button */}
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className={commonButtonClasses} // Use the common style
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      {/* Data management toggle button */}
      {onToggleDataManagement && (
        <button
          onClick={onToggleDataManagement}
          className={commonButtonClasses} // Use the common style
          title={isDataManagementVisible ? 'Hide Data Management' : 'Show Data Management'}
        >
          {isDataManagementVisible ? <X size={18} /> : <Database size={18} />}
        </button>
      )}
    </div>
  );
});

Header.displayName = 'Header';
export default Header;