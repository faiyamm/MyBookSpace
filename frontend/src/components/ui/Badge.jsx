import React from 'react';

/**
 * Badge - Reusable badge component for status display
 * Follows Open/Closed Principle with variant system
 */
export default function Badge({
  text,
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-[#5F7464] text-white',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-4 py-2'
  };

  return (
    <span className={`inline-block rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {text}
    </span>
  );
}
