import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage sidebar resize functionality
 * @param {number} initialWidth - Initial width in pixels
 * @param {number} minWidth - Minimum allowed width
 * @param {number} maxWidth - Maximum allowed width  
 * @returns {Object} - Sidebar width, drag state, and resize handler
 */
const useResizableSidebar = (initialWidth = 400, minWidth = 180, maxWidth = 500) => {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);

  // Start dragging
  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse movement during drag
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      
      const newWidth = e.clientX;
      
      // Restrict width within min/max bounds
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    },
    [isDragging, minWidth, maxWidth]
  );

  // End dragging
  const stopResize = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, [isDragging, handleMouseMove, stopResize]);

  return {
    sidebarWidth,
    isDragging,
    startResize,
  };
};

export default useResizableSidebar; 