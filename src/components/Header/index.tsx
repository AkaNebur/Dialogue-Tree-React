import React, { memo } from 'react';
import { Moon, Sun, Database, X } from 'lucide-react';

// --- Consistent Style Definition (Matches CardSidebar/NodePositioner) ---
const sidebarIconButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1";
// --- End Style Definition ---

interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  isDataManagementVisible?: boolean;
  onToggleDataManagement?: () => void;
}

const Header: React.FC<HeaderProps> = memo(({
  isDarkMode = false,
  onToggleTheme,
  isDataManagementVisible = false,
  onToggleDataManagement,
}) => {
  return (
    <div className="flex space-x-3">
      {onToggleTheme && (
        <button
          onClick={onToggleTheme}
          className={sidebarIconButtonClasses} // Use consistent style
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      {onToggleDataManagement && (
        <button
          onClick={onToggleDataManagement}
          className={sidebarIconButtonClasses} // Use consistent style
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