import React, { useState } from 'react';
import { TooltipProps } from '../../types';

/**
 * Tooltip component for sidebar elements
 */
const Tooltip: React.FC<TooltipProps> = ({ text, children, position = "right" }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // Position classes based on the position prop
  const positionClasses: Record<string, string> = {
    right: "left-full ml-2",
    left: "right-full mr-2",
    top: "bottom-full mb-2 left-1/2 transform -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 transform -translate-x-1/2"
  };
  
  return (
    <div className="relative inline-block" 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}>
      {children}
      
      {isVisible && (
        <div className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}>
          {text}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            position === "right" ? "left-0 top-1/2 -translate-y-1/2 -ml-1" :
            position === "left" ? "right-0 top-1/2 -translate-y-1/2 -mr-1" :
            position === "top" ? "bottom-0 left-1/2 -translate-x-1/2 -mb-1" :
            "top-0 left-1/2 -translate-x-1/2 -mt-1"
          }`}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;