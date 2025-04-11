import React from 'react';
import { GitFork } from 'lucide-react';

interface NodePositionerProps {
  onClick: () => void;
}

const NodePositioner: React.FC<NodePositionerProps> = ({ onClick }) => {

  // Define the common style matching CardSidebar top buttons
  const commonButtonClasses = "bg-blue-50 hover:bg-blue-100 dark:bg-dark-surface dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-blue-100 dark:border-dark-border";

  return (
    <button
      onClick={onClick}
      className={commonButtonClasses} // Use the common style
      title="Toggle Node positioning options"
    >
      <GitFork size={18} /> {/* Matched icon size to others */}
    </button>
  );
};

export default NodePositioner;