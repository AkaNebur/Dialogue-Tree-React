// File: src/components/ui/IconButton.tsx

// src/components/ui/IconButton.tsx - Modified to match original styling
import React from 'react';

export type IconButtonVariant = 'primary' | 'gray' | 'danger' | 'original';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  icon: React.ReactNode;
  label?: string;
  isLoading?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'gray',
  icon,
  label,
  isLoading = false,
  className = '',
  ...props
}) => {
  // Define styles based on variant
  let buttonClasses = '';

  if (variant === 'original') {
    // Use the original styling from the old top-left buttons
    buttonClasses = "bg-[var(--color-surface)] hover:bg-gray-800 text-gray-300 rounded-xl p-2 transition-colors shadow-lg border-2 border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1";
  } else {
    // Base classes for the other variants
    const baseClasses = "rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";

    // Variant-specific classes
    const variantClasses = {
      primary: "text-gray-400 hover:text-gray-300 bg-gray-500/20 hover:bg-gray-500/30 focus:ring-gray-400",
      gray: "text-gray-400 hover:text-gray-300 bg-[var(--color-surface)] hover:bg-gray-800 focus:ring-gray-400",
      danger: "text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 focus:ring-red-400"
    };

    buttonClasses = `${baseClasses} ${variantClasses[variant]}`;
  }

  // Combine with any additional custom classes
  const combinedClasses = `${buttonClasses} ${className}`;

  return (
    <button
      className={combinedClasses}
      aria-label={label}
      title={label}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon}
    </button>
  );
};

export default IconButton;