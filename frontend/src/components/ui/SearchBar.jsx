import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar - Specialized search input component
 * Follows Interface Segregation Principle
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  className = ''
}) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F7464]"
      />
    </div>
  );
}
