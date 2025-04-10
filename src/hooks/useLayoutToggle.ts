// src/hooks/useLayoutToggle.ts
import { useState, useCallback, useEffect } from 'react';

interface UseLayoutToggleReturnModified {
  isHorizontal: boolean;
  toggleLayout: () => void;
  setLayout: (horizontal: boolean) => void;
  direction: 'horizontal' | 'vertical';
}
const useLayoutToggle = (
  updateNodeLayout: (isHorizontal: boolean) => void,
  onDirectionChange: (newIsHorizontal: boolean) => void, // Callback when state changes
  initialHorizontal: boolean = true,
  savePreference: boolean = true
): UseLayoutToggleReturnModified => {
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

  const [isHorizontal, setIsHorizontal] = useState<boolean>(getSavedPreference());

  const performLayoutChange = useCallback((newIsHorizontal: boolean) => {
     // Update state FIRST
     setIsHorizontal(newIsHorizontal);

     if (savePreference) {
       try {
         localStorage.setItem(
           'dialogueBuilderLayoutDirection',
           newIsHorizontal ? 'horizontal' : 'vertical'
         );
       } catch (e) {
         console.warn('Failed to save layout preference to localStorage', e);
       }
     }
     // Call the callback AFTER state update is requested
     onDirectionChange(newIsHorizontal);
  }, [savePreference, onDirectionChange]); // Removed setIsHorizontal from deps

  const toggleLayout = useCallback(() => {
    const newValue = !isHorizontal;
    performLayoutChange(newValue);
  }, [isHorizontal, performLayoutChange]);

  const setLayout = useCallback((horizontal: boolean) => {
    if (horizontal === isHorizontal) return; // No change needed
    performLayoutChange(horizontal);
  }, [isHorizontal, performLayoutChange]);

  // Update node handle positions immediately when direction changes state
  useEffect(() => {
    console.log(`[useLayoutToggle] Updating node handles for direction: ${isHorizontal ? 'horizontal' : 'vertical'}`);
    updateNodeLayout(isHorizontal);
  }, [isHorizontal, updateNodeLayout]);

  return {
    isHorizontal,
    toggleLayout,
    setLayout,
    direction: isHorizontal ? 'horizontal' : 'vertical'
  };
};

export default useLayoutToggle;