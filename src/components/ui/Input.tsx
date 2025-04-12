// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { inputStyles, formStyles } from '../../styles/commonStyles';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  sizeVariant?: InputSize;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  sizeVariant = 'md',
  error,
  helpText,
  leftIcon,
  rightIcon,
  className = '',
  fullWidth = true,
  id,
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Determine if the input is invalid
  const isInvalid = !!error;
  
  // Combine styles
  const inputClasses = [
    inputStyles.base,
    inputStyles.size[sizeVariant],
    props.disabled ? inputStyles.disabled : '',
    isInvalid ? 'border-red-600 focus:ring-red-400' : '',
    fullWidth ? 'w-full' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={formStyles.group}>
      {label && (
        <label htmlFor={inputId} className={formStyles.label}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={isInvalid}
          aria-describedby={`${inputId}-error ${inputId}-help`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${inputId}-help`} className={formStyles.helpText}>
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;