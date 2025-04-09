import React, { useState, useCallback, useEffect } from 'react';
import { ArrowUpDown, Grid, AlignJustify, AlignLeft, CornerUpLeft, CornerDownRight, ChevronsUp, ChevronsDown, ArrowDown, ArrowRight } from 'lucide-react';

// Types of positioning layouts
type PositioningMode = 'grid' | 'cascade' | 'horizontal' | 'vertical' | 'radial' | 'compact' | 'custom';

const NodePositioner = ({ 
  onApplyLayout, 
  currentLayout = 'horizontal', 
  nodeCount = 0,
  isHorizontal, // Added prop to know current direction state
  onToggleDirection, // Added prop for direction toggle function
  onFitView // Added prop for fit view function
}) => {
  const [positioningMode, setPositioningMode] = useState(currentLayout);
  const [isOpen, setIsOpen] = useState(false);
  const [spacing, setSpacing] = useState(150);
  const [gridColumns, setGridColumns] = useState(3);

  useEffect(() => {
    setPositioningMode(currentLayout);
  }, [currentLayout]);

  // Standard layout application
  const applyLayout = useCallback(() => {
    onApplyLayout(positioningMode, { spacing, gridColumns });
    setIsOpen(false);
  }, [positioningMode, onApplyLayout, spacing, gridColumns]);

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

  // Handler for button selection
  const handleSelectMode = useCallback((mode) => {
    setPositioningMode(mode);
    
    // Special case for horizontal/vertical toggle
    const isDirectionChange = 
      (mode === 'horizontal' && !isHorizontal) || 
      (mode === 'vertical' && isHorizontal);
    
    if (isDirectionChange) {
      handleDirectionToggle();
    }
  }, [isHorizontal, handleDirectionToggle]);

  // Layout options with icons and descriptions
  const layoutOptions = [
    { 
      mode: 'horizontal', 
      icon: <AlignJustify size={18} />, 
      label: 'Horizontal Flow', 
      description: 'Arrange nodes in horizontal levels',
      isDirectionOption: true,
      active: isHorizontal
    },
    { 
      mode: 'vertical', 
      icon: <AlignLeft size={18} className="rotate-90" />, 
      label: 'Vertical Flow', 
      description: 'Arrange nodes in vertical columns',
      isDirectionOption: true,
      active: !isHorizontal
    },
    { 
      mode: 'grid', 
      icon: <Grid size={18} />, 
      label: 'Grid', 
      description: 'Organize nodes in a grid pattern',
      isDirectionOption: false
    },
    { 
      mode: 'cascade', 
      icon: <CornerDownRight size={18} />, 
      label: 'Cascade', 
      description: 'Staggered arrangement flowing diagonally',
      isDirectionOption: false
    },
    { 
      mode: 'radial', 
      icon: <ArrowUpDown size={18} className="rotate-45" />, 
      label: 'Radial', 
      description: 'Nodes arranged in a circular pattern',
      isDirectionOption: false
    },
    { 
      mode: 'compact', 
      icon: <ChevronsUp size={18} className="rotate-90" />, 
      label: 'Compact', 
      description: 'Minimizes overall space usage',
      isDirectionOption: false
    }
  ];

  // Find current option for the button display
  const currentOption = layoutOptions.find(opt => {
    if (opt.isDirectionOption) {
      return (opt.mode === 'horizontal' && isHorizontal) || 
             (opt.mode === 'vertical' && !isHorizontal);
    }
    return opt.mode === positioningMode;
  });

  return (
    <div className="relative">
      {/* Main button showing current layout mode */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors shadow-md flex items-center justify-center"
        title={`Node positioning: ${currentOption?.label || 'Layout Options'}`}
      >
        {currentOption?.icon || <Grid size={20} />}
      </button>

      {/* Dropdown panel with layout options */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-dark-surface rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Position {nodeCount} Nodes
            </h3>
          </div>

          {/* Section: Flow Direction */}
          <div className="p-2 border-b border-gray-200 dark:border-dark-border">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase">
              Direction
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleSelectMode('horizontal')}
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
                onClick={() => handleSelectMode('vertical')}
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

          {/* Layout options */}
          <div className="p-1 max-h-64 overflow-y-auto">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1 uppercase">
              Layout Patterns
            </h4>
            {layoutOptions.filter(opt => !opt.isDirectionOption).map(option => (
              <button
                key={option.mode}
                onClick={() => handleSelectMode(option.mode)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                  positioningMode === option.mode && !option.isDirectionOption
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Layout settings */}
          <div className="p-3 border-t border-gray-200 dark:border-dark-border">
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Node Spacing
              </label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="80" 
                  max="300" 
                  value={spacing} 
                  onChange={(e) => setSpacing(Number(e.target.value))} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 w-8">{spacing}px</span>
              </div>
            </div>

            {positioningMode === 'grid' && (
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grid Columns
                </label>
                <div className="flex items-center">
                  <input 
                    type="range" 
                    min="2" 
                    max="6" 
                    value={gridColumns} 
                    onChange={(e) => setGridColumns(Number(e.target.value))} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <span className="ml-2 text-xs text-gray-600 dark:text-gray-400 w-8">{gridColumns}</span>
                </div>
              </div>
            )}

            <button
              onClick={applyLayout}
              className="w-full mt-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Apply Layout
            </button>
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