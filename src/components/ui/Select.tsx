// File: src/components/ui/Select.tsx

import React, { forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { inputStyles, formStyles } from '../../styles/commonStyles'; // Keep the import

// Define the shape of each option
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helpText?: string;
  leftIcon?: ReactNode; // Added for potential future use, consistency with Input
  fullWidth?: boolean;
  placeholder?: string; // Optional placeholder text
  sizeVariant?: keyof typeof inputStyles.size; // Use keys from inputStyles for consistency
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  helpText,
  leftIcon, // Not used visually yet, but included for API consistency
  className = '',
  fullWidth = true,
  id,
  placeholder,
  sizeVariant = 'md', // Default size
  disabled,
  value, // Ensure value prop is destructured
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  // Determine if the select is invalid
  const isInvalid = !!error;

  // Combine styles
  const selectClasses = [
    inputStyles.base, // Reuse base input styles
    inputStyles.size[sizeVariant],
    disabled ? inputStyles.disabled : '',
    isInvalid ? 'border-red-600 focus:ring-red-400' : '', // Error state
    fullWidth ? 'w-full' : '',
    leftIcon ? 'pl-10' : '', // Add padding if icon exists (even if not rendered yet)
    'pr-10', // Always add padding for the dropdown arrow
    'appearance-none', // Hide default browser arrow
    !value && placeholder ? 'text-gray-500' : '', // Style placeholder text if value is empty
    className // Apply custom className last to allow overrides
  ].filter(Boolean).join(' ');

  return (
    // Apply formStyles.group to the outer container div
    <div className={formStyles.group}>
      {label && (
        // Apply formStyles.label to the label element
        <label htmlFor={selectId} className={formStyles.label}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icon placeholder if needed in future
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {leftIcon}
          </div>
        )}
        */}

        <select
          ref={ref}
          id={selectId}
          className={selectClasses} // selectClasses already defined above
          aria-invalid={isInvalid}
          aria-describedby={`${selectId}-error ${selectId}-help`}
          disabled={disabled}
          value={value} // Pass the value prop here
          {...props} // Spread remaining props like onChange, name, required etc.
        >
          {/* Optional Placeholder */}
          {placeholder && (
            <option value="" disabled hidden={!placeholder} >
              {placeholder}
            </option>
          )}

          {/* Map through options */}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow Indicator */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
          <ChevronDown size={16} />
        </div>
      </div>

      {error && (
        // Apply formStyles.error to the error message paragraph
        <p id={`${selectId}-error`} className={formStyles.error}>
          {error}
        </p>
      )}

      {helpText && !error && (
        // Apply formStyles.helpText to the help text paragraph
        <p id={`${selectId}-help`} className={formStyles.helpText}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;