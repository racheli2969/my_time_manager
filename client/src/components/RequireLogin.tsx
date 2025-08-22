import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Dialog } from './Dialog';

interface RequireLoginProps {
  children: (trigger: () => void) => React.ReactNode;
  action: () => void;
  message?: string;
}

/**
 * RequireLogin wraps any action and shows a login dialog if the user is not logged in.
 * Usage:
 * <RequireLogin action={yourAction}>{(trigger) => <button onClick={trigger}>Do Something</button>}</RequireLogin>
 */
export const RequireLogin: React.FC<RequireLoginProps> = ({ children, action, message }) => {
  const { currentUser } = useUser();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleTrigger = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    action();
  };

  return (
    <>
      {children(handleTrigger)}
      {showLoginPrompt && (
        <Dialog open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)}>
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Login Required</h2>
            <p className="mb-4">{message || 'You must be logged in to perform this action.'}</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => window.location.href = '/login'}>Login</button>
          </div>
        </Dialog>
      )}
    </>
  );
};
