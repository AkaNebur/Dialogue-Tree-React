// src/hooks/useLayoutToggle.ts
import { useState, useCallback, useEffect } from 'react';
import { UseLayoutToggleReturn } from '../types';

/**
 * Custom hook to manage layout direction
 * @param updateNodeLayout - Function to update node layouts
 * @param triggerAutoLayout - Function to trigger auto layout
 * @returns Layout state and toggle function
 */
const useLayoutToggle = (
  updateNodeLayout: (isHorizontal: boolean) => void,
  triggerAutoLayout: () => void
): UseLayoutToggleReturn => {
  const [isHorizontal, setIsHorizontal] = useState<boolean>(true);

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