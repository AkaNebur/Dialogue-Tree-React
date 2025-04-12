// src/hooks/useNpcLayoutToggle.ts
import { useState, useCallback, useEffect } from 'react';
import { useDialogueStore, useSidebarData } from '../store/dialogueStore';
import { DEFAULT_NPC_LAYOUT_HORIZONTAL } from '../constants/initialData';

interface UseNpcLayoutToggleReturn {
  isHorizontal: boolean;
  toggleLayout: () => void;
  setLayout: (horizontal: boolean) => void;
  direction: 'horizontal' | 'vertical';
}

const useNpcLayoutToggle = (): UseNpcLayoutToggleReturn => {
  const selectedNpc = useDialogueStore(state => state.selectedNpc());
  const { updateNpcLayoutDirection } = useSidebarData();
  
  const [isHorizontal, setIsHorizontal] = useState<boolean>(
    selectedNpc?.isHorizontal !== undefined 
      ? selectedNpc.isHorizontal 
      : DEFAULT_NPC_LAYOUT_HORIZONTAL
  );
  
  useEffect(() => {
    if (selectedNpc) {
      const npcDirection = selectedNpc.isHorizontal !== undefined 
        ? selectedNpc.isHorizontal 
        : DEFAULT_NPC_LAYOUT_HORIZONTAL;
      
      setIsHorizontal(npcDirection);
      console.log(`[useNpcLayoutToggle] Updated direction for NPC ${selectedNpc.id}: ${npcDirection ? 'horizontal' : 'vertical'}`);
    }
  }, [selectedNpc?.id]);

  const setLayout = useCallback((horizontal: boolean) => {
    if (!selectedNpc) return;
    
    if (horizontal !== isHorizontal) {
      setIsHorizontal(horizontal);
      updateNpcLayoutDirection(selectedNpc.id, horizontal);
      console.log(`[useNpcLayoutToggle] Direction changed for NPC ${selectedNpc.id}: ${horizontal ? 'horizontal' : 'vertical'}`);
    }
  }, [selectedNpc, isHorizontal, updateNpcLayoutDirection]);

  const toggleLayout = useCallback(() => {
    setLayout(!isHorizontal);
  }, [isHorizontal, setLayout]);

  return {
    isHorizontal,
    toggleLayout,
    setLayout,
    direction: isHorizontal ? 'horizontal' : 'vertical'
  };
};

export default useNpcLayoutToggle;