// src/hooks/useThemeToggle.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook to manage theme (light/dark mode)
 * @returns Theme state and toggle function
 */
const useThemeToggle = (initialDarkMode = false) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialDarkMode);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Apply the theme class to the HTML document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleTheme,
  };
};

export default useThemeToggle;