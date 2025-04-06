import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage layout direction
 * @param {Function} updateNodeLayout - Function to update node layouts
 * @param {Function} triggerAutoLayout - Function to trigger auto layout
 * @returns {Object} Layout state and toggle function
 */
const useLayoutToggle = (updateNodeLayout, triggerAutoLayout) => {
  const [isHorizontal, setIsHorizontal] = useState(true);

  // Toggle layout between horizontal and vertical
  const toggleLayout = useCallback(() => {
    setIsHorizontal((prev) => !prev);
  }, []);

  // Update node layouts when direction changes
  useEffect(() => {
    updateNodeLayout(isHorizontal);
    
    // Allow DOM to update before calculating new layout
    const timer = setTimeout(() => {
      triggerAutoLayout();
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isHorizontal, updateNodeLayout, triggerAutoLayout]);

  return {
    isHorizontal,
    toggleLayout,
  };
};

export default useLayoutToggle;