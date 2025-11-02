/**
 * Login Prompt Component
 * Modal prompting user to login
 */

import React from 'react';

interface LoginPromptProps {
  onClose: () => void;
  onLogin: () => void;
}

/**
 * Modal that prompts users to log in
 */
export const LoginPrompt: React.FC<LoginPromptProps> = ({ onClose, onLogin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="mb-4">You must be logged in to manage teams.</p>
        <div className="flex gap-3 justify-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={onLogin}
          >
            Login
          </button>
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
