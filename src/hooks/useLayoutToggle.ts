// src/hooks/useLayoutToggle.ts
import { useState, useCallback, useEffect } from 'react';
import { UseLayoutToggleReturn } from '../types';

/**
 * Custom hook to manage node layout direction (horizontal/vertical)
 * Now integrated with the NodePositioner component.
 * 
 * @param updateNodeLayout - Function to update node handle positions
 * @param triggerAutoLayout - Function to trigger automatic layout calculation
 * @param initialHorizontal - Initial layout direction (default: true = horizontal)
 * @param savePreference - Whether to save layout preference to localStorage (default: true)
 * @returns Layout state and toggle function
 */
const useLayoutToggle = (
  updateNodeLayout: (isHorizontal: boolean) => void,
  triggerAutoLayout: () => void,
  initialHorizontal: boolean = true,
  savePreference: boolean = true
): UseLayoutToggleReturn => {
  // Try to get saved preference from localStorage
  const getSavedPreference = (): boolean => {
    if (!savePreference) return initialHorizontal;
    
    try {
      const saved = localStorage.getItem('dialogueBuilderLayoutDirection');
      return saved === null ? initialHorizontal : saved === 'horizontal';
    } catch (e) {
      console.warn('Failed to read layout preference from localStorage', e);
      return initialHorizontal;
    }
  };

  // Initialize state with saved preference or default
  const [isHorizontal, setIsHorizontal] = useState<boolean>(getSavedPreference());

  // Toggle layout between horizontal and vertical
  const toggleLayout = useCallback(() => {
    setIsHorizontal((prev) => {
      const newValue = !prev;
      
      // Save preference to localStorage if enabled
      if (savePreference) {
        try {
          localStorage.setItem(
            'dialogueBuilderLayoutDirection', 
            newValue ? 'horizontal' : 'vertical'
          );
        } catch (e) {
          console.warn('Failed to save layout preference to localStorage', e);
        }
      }
      
      return newValue;
    });
  }, [savePreference]);
  
  // Directly set layout to a specific direction
  const setLayout = useCallback((horizontal: boolean) => {
    if (horizontal === isHorizontal) return; // No change needed
    
    setIsHorizontal(horizontal);
    
    // Save preference to localStorage if enabled
    if (savePreference) {
      try {
        localStorage.setItem(
          'dialogueBuilderLayoutDirection', 
          horizontal ? 'horizontal' : 'vertical'
        );
      } catch (e) {
        console.warn('Failed to save layout preference to localStorage', e);
      }
    }
  }, [isHorizontal, savePreference]);

  // Update node handle positions when direction changes
  useEffect(() => {
    console.log(`[useLayoutToggle] Updating layout direction: ${isHorizontal ? 'horizontal' : 'vertical'}`);
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
    setLayout,
    direction: isHorizontal ? 'horizontal' : 'vertical'
  };
};

export default useLayoutToggle;