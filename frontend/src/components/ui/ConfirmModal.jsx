import React from 'react';
import Button from './Button';

/**
 * ConfirmModal - Reusable confirmation dialog component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed/cancelled
 * @param {function} onConfirm - Callback when user confirms the action
 * @param {string} title - Modal title (default: 'Confirm Action')
 * @param {string} message - Confirmation message (default: 'Are you sure you want to proceed?')
 * @param {string} confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 * @param {string} confirmVariant - Button variant: 'primary' | 'secondary' (default: 'primary')
 * @param {boolean} danger - If true, applies red danger styling to confirm button (default: false)
 * 
 * @example
 * <ConfirmModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Item"
 *   message="Are you sure you want to delete this item?"
 *   confirmText="Delete"
 *   danger={true}
 * />
 */
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  danger = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant={confirmVariant}
            className={`flex-1 ${danger ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
