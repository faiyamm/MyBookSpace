import React from 'react';
import BaseCard from './BaseCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * BookCard - Specialized card for displaying book information
 * Follows Single Responsibility and Interface Segregation principles
 */
export default function BookCard({ 
  book,
  onBookClick,
  onActionClick,
  actionLabel = 'Borrow Book',
  showAction = true,
  className = ''
}) {
  const { 
    id,
    title, 
    author, 
    genre, 
    cover_image_url,
    cover_url,
    available_copies = 0,
    isbn 
  } = book;

  const coverImage = cover_image_url || cover_url;
  const isAvailable = available_copies > 0;

  return (
    <BaseCard hover padding="p-0" className={className}>
      {/* Cover Image */}
      <div 
        className="cursor-pointer"
        onClick={() => onBookClick?.(id)}
      >
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title}
            className="w-full h-64 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-xl">
            <span className="text-gray-400">No cover</span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h4 
          className="font-bold text-[#2C3E2C] mb-1 cursor-pointer hover:text-[#5F7464] line-clamp-2"
          onClick={() => onBookClick?.(id)}
        >
          {title}
        </h4>
        <p className="text-sm text-[#5F7464] mb-3">{author}</p>

        {/* Badges */}
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant={isAvailable ? 'success' : 'danger'}
            text={isAvailable ? `${available_copies} Available` : 'Unavailable'}
          />
          {genre && (
            <span className="text-xs text-[#5F7464]">{genre}</span>
          )}
        </div>

        {/* Action Button */}
        {showAction && (
          <Button
            onClick={() => onActionClick?.(id)}
            disabled={!isAvailable}
            fullWidth
            size="sm"
          >
            {isAvailable ? actionLabel : 'Not Available'}
          </Button>
        )}
      </div>
    </BaseCard>
  );
}
