import React from 'react';

/**
 * Button - Reusable button component
 * Follows Open/Closed Principle with variant system
 */
export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon
}) {
  const baseClasses = 'font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-[#5F7464] text-white hover:bg-[#4A5D4A] disabled:bg-gray-300',
    outline: 'border border-[#5F7464] text-[#5F7464] hover:bg-[#5F7464] hover:text-white disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300',
    ghost: 'text-[#5F7464] hover:bg-gray-100 disabled:opacity-50'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };

  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
