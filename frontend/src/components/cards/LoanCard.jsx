import React from 'react';
import BaseCard from './BaseCard';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * LoanCard - Specialized card for displaying loan information
 * Follows Single Responsibility Principle
 */
export default function LoanCard({ 
  loan,
  onRenew,
  onReturn,
  showActions = true,
  className = ''
}) {
  const { 
    id,
    book,
    loan_date,
    expiration_date,
    status,
    fine_amount,
    renewals = 0
  } = loan;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = status === 'overdue' || status === 'Overdue';
  const isActive = status === 'active' || status === 'On Loan';
  const canRenew = renewals < 2 && !isOverdue;
  const fineAmount = fine_amount || 0;

  const getStatusVariant = () => {
    if (isOverdue) return 'danger';
    if (isActive) return 'success';
    return 'default';
  };

  return (
    <BaseCard border hover className={className}>
      <div className="flex gap-4">
        {/* Book Cover */}
        {book?.cover_image_url || book?.cover_url ? (
          <img 
            src={book.cover_image_url || book.cover_url} 
            alt={book.title}
            className="w-24 h-32 object-cover rounded"
          />
        ) : (
          <div className="w-24 h-32 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400 text-xs">No cover</span>
          </div>
        )}

        {/* Loan Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-[#2C3E2C]">
                {book?.title || 'Unknown Book'}
              </h4>
              <p className="text-sm text-[#5F7464]">
                {book?.author || 'Unknown Author'}
              </p>
            </div>
            <Badge 
              variant={getStatusVariant()}
              text={isActive ? 'Active' : isOverdue ? 'Overdue' : status}
            />
          </div>
          
          <div className="text-sm text-[#5F7464] space-y-1 mb-3">
            <p><strong>Borrowed:</strong> {formatDate(loan_date)}</p>
            {expiration_date && (
              <p><strong>Due:</strong> {formatDate(expiration_date)}</p>
            )}
            {fineAmount > 0 && (
              <p className="text-red-600">
                <strong>Fine:</strong> ${fineAmount.toFixed(2)}
              </p>
            )}
            <p className="text-xs">Renewals: {renewals}/2</p>
          </div>

          {/* Actions */}
          {showActions && (isActive || isOverdue) && (
            <div className="flex gap-2">
              <Button
                onClick={() => onRenew?.(id)}
                disabled={!canRenew}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Renew
              </Button>
              <Button
                onClick={() => onReturn?.(id)}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                Return
              </Button>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}
