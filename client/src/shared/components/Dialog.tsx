/**
 * Dialog Component
 * Reusable modal/dialog component for alerts and confirmations
 */

import React from 'react';

interface DialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRedirect?: () => void;
  redirectLabel?: string;
  isLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  title = 'Dialog',
  message,
  onClose,
  onRedirect,
  redirectLabel = 'Proceed',
  isLoading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
          {onRedirect && (
            <button
              onClick={onRedirect}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : redirectLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
