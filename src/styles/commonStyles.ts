// src/styles/commonStyles.ts
// Centralized styling system for the Dialogue Builder application

// ============================================================
// COLOR TOKENS
// Reflecting the CSS variables from styles/index.css
// ============================================================
export const colors = {
    // Primary background and surface colors
    bg: {
      main: 'bg-[var(--color-bg)]',
      surface: 'bg-[var(--color-surface)]',
      overlay: 'bg-black/60',
      panel: 'bg-[var(--color-panel)]',
    },
    
    // Borders
    border: {
      main: 'border-[var(--color-border)]',
      light: 'border-gray-600',
      lighter: 'border-gray-500',
      focus: 'focus:border-transparent',
    },
    
    // Text colors
    text: {
      primary: 'text-[var(--color-text)]', // Primary text
      secondary: 'text-gray-300', // Secondary text
      muted: 'text-gray-400',     // Less prominent text
      placeholder: 'text-gray-500', // Placeholder text
    },
    
    // Accent and interaction colors
    accent: {
      red: {
        primary: 'bg-red-600',
        hover: 'hover:bg-red-700',
        active: 'active:bg-red-800',
        text: 'text-red-400',
        focus: 'focus:ring-red-400',
        light: 'bg-red-500/20',
      },
      green: {
        primary: 'bg-green-600',
        hover: 'hover:bg-green-700',
        active: 'active:bg-green-800',
        text: 'text-green-400',
        focus: 'focus:ring-green-400',
        light: 'bg-green-500/20',
      },
      yellow: {
        primary: 'bg-yellow-600',
        hover: 'hover:bg-yellow-700',
        active: 'active:bg-yellow-800',
        text: 'text-yellow-400',
        focus: 'focus:ring-yellow-400',
        light: 'bg-yellow-900/30',
      },
      gray: {
        primary: 'bg-gray-700',
        hover: 'hover:bg-gray-600',
        active: 'active:bg-gray-500',
        text: 'text-gray-300',
        focus: 'focus:ring-gray-400',
        light: 'bg-gray-500/20',
      }
    },
  };
  
  // ============================================================
  // TYPOGRAPHY
  // ============================================================
  export const typography = {
    // Headings
    heading: {
      lg: 'text-lg font-semibold text-gray-300',
      md: 'text-md font-semibold text-gray-300',
      sm: 'text-base font-semibold text-gray-300',
    },
    
    // Body text
    body: {
      lg: 'text-base text-gray-300',
      md: 'text-sm text-gray-300',
      sm: 'text-xs text-gray-400',
    },
    
    // Other specialized text styles
    label: 'block text-sm font-medium text-gray-300 mb-1.5',
    placeholder: 'text-xs italic text-gray-500',
    sectionTitle: 'text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide',
  };
  
  // ============================================================
  // EFFECTS & TRANSITIONS
  // ============================================================
  export const effects = {
    // Focus styles
    focus: {
      primary: 'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1',
      danger: 'focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1',
      gray: 'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1',
    },
    
    // Transitions
    transition: {
      fast: 'transition-all duration-150',
      normal: 'transition-all duration-200',
      slow: 'transition-all duration-300',
    },
    
    // Shadows
    shadow: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    }
  };
  
  // ============================================================
  // COMPONENT STYLES
  // ============================================================
  
  // -----------------------------
  // Button Styles
  // -----------------------------
  export const buttonStyles = {
    // Base button styles
    base: `inline-flex items-center justify-center font-medium rounded-md 
           focus:outline-none focus:ring-2 focus:ring-offset-1 
           transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed`,
    
    // Button sizes
    size: {
      xs: 'px-1.5 py-1 text-xs',
      sm: 'px-2 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    },
    
    // Button variants
    variant: {
      primary: `text-white ${colors.accent.gray.primary} ${colors.accent.gray.hover} ${colors.accent.gray.focus}`,
      secondary: `${colors.text.secondary} ${colors.accent.gray.primary} ${colors.accent.gray.hover} ${colors.accent.gray.focus}`,
      danger: `text-white ${colors.accent.red.primary} ${colors.accent.red.hover} ${colors.accent.red.focus}`,
      ghost: `${colors.text.secondary} hover:bg-gray-700 ${effects.focus.gray}`,
      yellow: `text-yellow-200 ${colors.accent.yellow.primary} ${colors.accent.yellow.hover} ${colors.accent.yellow.focus}`,
    },
    
    // Icon button variants
    icon: {
      base: `rounded-full p-2 ${effects.transition.normal} ${effects.focus.primary}`,
      primary: `text-gray-400 hover:text-gray-300 bg-gray-500/20 hover:bg-gray-500/30`,
      gray: `text-gray-400 hover:text-gray-300 bg-[var(--color-surface)] hover:bg-gray-800`,
      danger: `text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30`,
    },
  };
  
  // -----------------------------
  // Input Styles
  // -----------------------------
  export const inputStyles = {
    base: `w-full px-3 py-2 text-sm rounded-md 
           border ${colors.border.light} ${colors.bg.main} ${colors.text.primary}
           placeholder-gray-500 ${colors.border.focus} ${effects.focus.primary} shadow-inner`,
    
    disabled: 'opacity-70 cursor-not-allowed bg-gray-800',
    
    // Input sizes
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    },
  };
  
  // -----------------------------
  // Panel/Card Styles
  // -----------------------------
  export const panelStyles = {
    base: `${colors.bg.surface} rounded-xl shadow-lg border-2 ${colors.border.main} ${effects.transition.normal}`,
    
    header: {
      base: `flex justify-between items-center p-4 border-b ${colors.border.main}`,
      title: typography.heading.lg,
    },
    
    body: {
      base: 'p-4',
      scrollable: 'overflow-y-auto card-scrollbar',
    },
    
    footer: {
      base: `p-4 border-t ${colors.border.main} flex justify-between items-center`,
    },
    
    variants: {
      sidebar: 'w-64',
      modal: 'w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col',
      floating: 'absolute z-50 shadow-xl',
    },
  };
  
  // -----------------------------
  // Card Item Styles (for NPC & Dialogue list items)
  // -----------------------------
  export const cardItemStyles = {
    base: `relative rounded-lg ${effects.transition.normal} border-2 group overflow-hidden flex h-12`,
    
    idle: `${colors.bg.main} ${colors.border.light} hover:border-gray-500`,
    selected: `${colors.accent.gray.light} border-gray-700`,
    
    text: `block w-full text-left p-3 pr-10 rounded-lg text-sm font-medium ${effects.transition.normal} flex items-center ${colors.text.primary}`,
    
    actions: {
      container: 'absolute right-0 top-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 px-1 py-2 justify-center',
      button: `p-1.5 rounded-full ${effects.focus.primary} transition-all transform hover:scale-105 active:scale-95`,
      edit: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
    },
  };
  
  // -----------------------------
  // Modal Styles
  // -----------------------------
  export const modalStyles = {
    backdrop: `fixed inset-0 ${colors.bg.overlay} z-50 flex items-center justify-center p-4 backdrop-blur-sm`,
    
    content: `${colors.bg.surface} rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${effects.transition.normal}`,
    
    header: `flex justify-between items-center p-4 border-b ${colors.border.main} flex-shrink-0`,
    
    body: 'p-4 overflow-y-auto card-scrollbar space-y-4',
    
    closeButton: `absolute top-3 right-3 text-gray-400 hover:text-gray-300 p-1 rounded-full ${effects.transition.normal} z-10 ${effects.focus.primary}`,
  };
  
  // -----------------------------
  // Tooltip Styles
  // -----------------------------
  export const tooltipStyles = {
    wrapper: 'relative inline-block',
    
    tooltip: 'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap',
    
    arrow: 'absolute w-2 h-2 bg-gray-900 transform rotate-45',
    
    // Positions
    position: {
      top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
      left: 'right-full mr-2',
      right: 'left-full ml-2',
    },
  };
  
  // -----------------------------
  // Form Styles
  // -----------------------------
  export const formStyles = {
    group: 'mb-4',
    
    label: typography.label,
    
    helpText: 'mt-1 text-xs text-gray-400',
    
    error: 'mt-1 text-xs text-red-400',
    
    actions: 'flex justify-end space-x-2 mt-4',
  };
  
  // -----------------------------
  // Alert/Message Styles
  // -----------------------------
  export const alertStyles = {
    base: 'rounded-md p-3 border',
    
    variants: {
      error: 'bg-red-900/30 border-red-800 text-red-200',
      warning: 'bg-yellow-900/30 border-yellow-800 text-yellow-200',
      success: 'bg-green-900/30 border-green-800 text-green-200',
      info: 'bg-gray-900/30 border-gray-800 text-gray-200',
    },
    
    title: 'text-sm font-semibold mb-1',
    
    message: 'text-sm',
  };
  
  // -----------------------------
  // Badge Styles
  // -----------------------------
  export const badgeStyles = {
    base: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
    
    variants: {
      red: 'bg-red-900/50 text-red-200',
      green: 'bg-green-900/50 text-green-200',
      yellow: 'bg-yellow-900/50 text-yellow-200',
      gray: 'bg-gray-700 text-gray-200',
    },
  };
  
  // -----------------------------
  // Layout Styles
  // -----------------------------
  export const layoutStyles = {
    sidebarWidth: 'w-64',
    
    mainContent: 'w-full h-full',
    
    // Common position styles
    position: {
      topLeft: 'absolute top-4 left-4',
      topRight: 'absolute top-4 right-4',
      bottomLeft: 'absolute bottom-4 left-4',
      bottomRight: 'absolute bottom-4 right-4',
      center: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      topCenter: 'absolute top-4 left-1/2 transform -translate-x-1/2',
    },
  };
  
  // Export common utility composites for frequently used combinations
  export const utilStyles = {
    flexCenter: 'flex items-center justify-center',
    flexBetween: 'flex items-center justify-between',
    flexColumn: 'flex flex-col',
    gridCenter: 'grid place-items-center',
  };
  
  // Root element styles for app-wide considerations
  export const rootStyles = {
    appContainer: 'w-screen h-screen relative overflow-hidden border-0 dark',
    screenOverlay: 'absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]',
  };