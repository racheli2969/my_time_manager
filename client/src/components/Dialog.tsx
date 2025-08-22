import React from 'react';

interface DialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onRedirect?: () => void;
  redirectLabel?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  message,
  onClose,
  onRedirect,
  redirectLabel = 'Go',
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          {onRedirect && (
            <button
              onClick={onRedirect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {redirectLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
