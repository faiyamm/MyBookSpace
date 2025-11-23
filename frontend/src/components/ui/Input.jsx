import React from 'react';

/**
 * Input - Reusable input component
 * Follows Single Responsibility Principle
 */
export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#2C3E2C] mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464] disabled:bg-gray-100 disabled:cursor-not-allowed ${
            Icon ? 'pl-10' : ''
          } ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-xs text-[#5F7464] mt-1">{helperText}</p>
      )}
    </div>
  );
}
