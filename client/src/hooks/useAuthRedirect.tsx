/**
 * Authentication Redirect Hook
 * Handles redirecting users to login when they try to access protected features
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../core/contexts/UserContext';
import { useState, useCallback } from 'react';

interface AuthRedirectDialog {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useAuthRedirect = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [dialog, setDialog] = useState<AuthRedirectDialog | null>(null);

  /**
   * Check if user is authenticated
   * If not, show dialog prompting to login
   * @param action - The action to execute if user is authenticated
   * @param message - Optional custom message to show in dialog
   * @returns boolean - true if authenticated, false otherwise
   */
  const requireAuth = useCallback((
    action?: () => void,
    message: string = 'You need to be signed in to perform this action. Would you like to login now?'
  ): boolean => {
    if (!currentUser) {
      setDialog({
        show: true,
        message,
        onConfirm: () => {
          setDialog(null);
          // Store the intended destination to redirect after login
          sessionStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
        },
        onCancel: () => {
          setDialog(null);
        }
      });
      return false;
    }

    // User is authenticated, execute the action
    if (action) {
      action();
    }
    return true;
  }, [currentUser, navigate, location.pathname]);

  /**
   * Execute action with authentication check
   * @param action - The action to execute if authenticated
   * @param message - Optional custom message
   */
  const withAuth = useCallback((
    action: () => void,
    message?: string
  ) => {
    requireAuth(action, message);
  }, [requireAuth]);

  /**
   * Close the dialog
   */
  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  return {
    requireAuth,
    withAuth,
    dialog,
    closeDialog,
    isAuthenticated: !!currentUser
  };
};
