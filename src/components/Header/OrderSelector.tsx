import React, { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';

interface OrderSelectorProps {
  currentStrategy: string;
}

const OrderSelector: React.FC<OrderSelectorProps> = ({ 
  currentStrategy}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {/* Main button that shows current strategy and toggles dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 text-white bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors shadow-md flex items-center justify-center"
        title="Change node ordering"
      >
        {currentStrategy || <ArrowDownUp size={20} />}
      </button>
      
      {/* Dropdown with ordering options */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Ordering</h3>
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