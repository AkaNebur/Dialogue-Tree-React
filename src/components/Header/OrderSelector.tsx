import React, { useState } from 'react';
import { ArrowDownUp, AlignJustify, AlignLeft, ArrowDown, Shuffle } from 'lucide-react';

// Node ordering strategies
export type OrderingStrategy = 'default' | 'alphabetical' | 'reverse' | 'compact' | 'shuffle';

interface OrderSelectorProps {
  currentStrategy: OrderingStrategy;
  onOrderChange: (strategy: OrderingStrategy) => void;
}

const OrderSelector: React.FC<OrderSelectorProps> = ({ 
  currentStrategy, 
  onOrderChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ordering strategies with their icons and descriptions
  const strategies: {type: OrderingStrategy; icon: React.ReactNode; label: string}[] = [
    { 
      type: 'default', 
      icon: <AlignJustify size={18} />, 
      label: 'Default Order' 
    },
    { 
      type: 'alphabetical', 
      icon: <AlignLeft size={18} />, 
      label: 'Alphabetical' 
    },
    { 
      type: 'reverse', 
      icon: <ArrowDown size={18} className="rotate-180" />, 
      label: 'Reverse Order' 
    },
    { 
      type: 'compact', 
      icon: <ArrowDownUp size={18} />, 
      label: 'Compact Layout' 
    },
    { 
      type: 'shuffle', 
      icon: <Shuffle size={18} />, 
      label: 'Random Shuffle' 
    }
  ];
  
  // Get current strategy details for display
  const currentStrategyDetails = strategies.find(s => s.type === currentStrategy);
  
  return (
    <div className="relative">
      {/* Main button that shows current strategy and toggles dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors shadow-md flex items-center justify-center"
        title="Change node ordering"
      >
        {currentStrategyDetails?.icon || <ArrowDownUp size={20} />}
      </button>
      
      {/* Dropdown with ordering options */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Ordering</h3>
          </div>
          <div className="p-1">
            {strategies.map(strategy => (
              <button
                key={strategy.type}
                onClick={() => {
                  onOrderChange(strategy.type);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                  currentStrategy === strategy.type 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg'
                }`}
              >
                <span className="mr-2">{strategy.icon}</span>
                <span>{strategy.label}</span>
              </button>
            ))}
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

export default OrderSelector;