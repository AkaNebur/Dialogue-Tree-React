import React, { useState, useCallback } from 'react';
import { ArrowDown, ArrowRight, GitFork } from 'lucide-react';

// Define simplified PositioningMode directly or import from types if redefined there
type PositioningMode = 'dagre'; // Only Dagre is actively applied via button now

interface NodePositionerProps {
  onApplyLayout: (mode: PositioningMode, options: any) => void;
  isHorizontal: boolean;
  onToggleDirection: () => void;
  onFitView?: () => void;
  // Optional: For direct layout setting from refactored hook
  setLayout?: (horizontal: boolean) => void;
}

/**
 * Node Positioning component with integrated layout direction controls
 * Updated with consistent styling matching the CardSidebar
 * Simplified to primarily handle direction toggle and trigger Dagre layout.
 */
const NodePositioner: React.FC<NodePositionerProps> = ({
  onApplyLayout,
  isHorizontal,
  onToggleDirection,
  onFitView,
  setLayout // Optional from refactored hook
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [spacing, setSpacing] = useState(150);

  // Memoized callback for applying Dagre layout
  const applyDagreLayout = useCallback(() => {
    onApplyLayout('dagre', { spacing });
  }, [onApplyLayout, spacing]);

  // Special handler for direction toggle (horizontal/vertical)
  const handleDirectionToggle = useCallback(() => {
    if (onToggleDirection) {
      onToggleDirection();

      // Fit view after toggle with a slight delay
      if (onFitView) {
        setTimeout(() => {
          onFitView();
        }, 100);
      }
      setIsOpen(false);
    }
  }, [onToggleDirection, onFitView]);

  // Handler for direct layout setting when available
  const handleSetDirection = useCallback((horizontal: boolean) => {
    // Use the new setLayout if available, otherwise fall back to toggle
    if (setLayout) {
      setLayout(horizontal);

      // Fit view after toggle with a slight delay
      if (onFitView) {
        setTimeout(() => {
          onFitView();
        }, 100);
      }
      setIsOpen(false);
    } else if (horizontal !== isHorizontal) {
      // Only toggle if we need to change the direction
      handleDirectionToggle();
    }
  }, [isHorizontal, handleDirectionToggle, setLayout, onFitView]);


  // Layout options with icons and descriptions - simplified to only include needed options

  return (
    <div className="relative">
      {/* Main button showing git-fork logo regardless of current layout mode */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors shadow-md flex items-center justify-center"
        title="Node positioning options"
      >
        <GitFork size={20} />
      </button>

      {/* Dropdown panel with layout options - CENTERED with the button */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white dark:bg-dark-surface rounded-2xl shadow-lg overflow-hidden z-50 border-2 border-blue-100 dark:border-dark-border transition-colors duration-300">
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">              Layout Options
            </h3>
          </div>

          {/* Section: Flow Direction */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
              Direction
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleSetDirection(true)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm ${
                  isHorizontal
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-bg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowRight size={16} />
                <span>Horizontal</span>
              </button>
              <button
                onClick={() => handleSetDirection(false)}
                className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm ${
                  !isHorizontal
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-bg dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <ArrowDown size={16} />
                <span>Vertical</span>
              </button>
            </div>
          </div>

          {/* Featured Dagre Layout Button */}
          <div className="p-4 border-b border-gray-200 dark:border-dark-border">
            <button
              onClick={() => {
                applyDagreLayout();
                setIsOpen(false); // Close dropdown after applying
                if (onFitView) {
                  setTimeout(onFitView, 100); // Fit view after applying
                }
              }}
              className="w-full py-3 px-4 flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100
                      dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200
                      rounded-md transition-colors"
            >
              <GitFork size={18} />
              <div className="text-left">
                <div className="font-medium">Smart Layout</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-300">Apply automatic Dagre layout</div>
              </div>
            </button>
          </div>

          {/* Layout settings */}
          <div className="p-4 border-t border-gray-200 dark:border-dark-border">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">
                Node Spacing
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={spacing}
                  onChange={(e) => {
                    const newSpacing = Number(e.target.value);
                    setSpacing(newSpacing);
                    // Optionally trigger layout on change, or just let the main button do it
                    // applyDagreLayout(); // Uncomment to apply layout immediately on slider change

                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 w-8">{spacing}px</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to capture clicks outside the dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NodePositioner;