/**
 * Login Prompt Component
 * Prompt shown when user needs to login
 */

import React from 'react';

interface LoginPromptProps {
  onClose: () => void;
  onLogin: () => void;
}

/**
 * Modal prompting user to login
 */
export const LoginPrompt: React.FC<LoginPromptProps> = ({ onClose, onLogin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center max-w-md">
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="mb-4 text-gray-600">
          You must be logged in to add events to your calendar.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
