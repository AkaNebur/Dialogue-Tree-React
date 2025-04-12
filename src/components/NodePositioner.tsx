import React from 'react';
import { GitFork } from 'lucide-react';

// --- Consistent Style Definition (Matches CardSidebar/Header) ---
const sidebarIconButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1";
// --- End Style Definition ---

interface NodePositionerProps {
  onClick: () => void;
}

const NodePositioner: React.FC<NodePositionerProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className={sidebarIconButtonClasses} // Use consistent style
      title="Toggle Layout Options"
    >
      <GitFork size={18} />
    </button>
  );
};

export default NodePositioner;