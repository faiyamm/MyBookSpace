import React from 'react';

/**
 * BaseCard - Reusable card component following Single Responsibility Principle
 * Handles styling and layout, delegates content to children
 */
export default function BaseCard({ 
  children, 
  className = '', 
  onClick,
  hover = false,
  padding = 'p-6',
  border = true,
  shadow = false
}) {
  const baseClasses = 'bg-white rounded-xl';
  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const shadowClasses = shadow ? 'shadow-md' : '';

  return (
    <div 
      className={`${baseClasses} ${borderClasses} ${hoverClasses} ${shadowClasses} ${padding} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
