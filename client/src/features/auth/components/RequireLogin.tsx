/**
 * Require Login Component
 * HOC that wraps actions requiring authentication
 */

import React, { useState } from 'react';
import { useUser } from '../../../core/contexts/UserContext';
import { Dialog } from '../../../shared/components/Dialog';

interface RequireLoginProps {
  children: (trigger: () => void) => React.ReactNode;
  action: () => void;
  message?: string;
}

/**
 * Wraps any action and shows a login dialog if user is not logged in
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
        <Dialog 
          open={showLoginPrompt} 
          onClose={() => setShowLoginPrompt(false)} 
          title="Login Required" 
          message={message || 'You must be logged in to perform this action.'} 
          onRedirect={() => window.location.href = '/login'} 
          redirectLabel="Login" 
        />
      )}
    </>
  );
};
