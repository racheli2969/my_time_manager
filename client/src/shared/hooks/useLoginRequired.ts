/**
 * useLoginRequired Hook
 * Helper hook to enforce login requirements for actions
 */

import { useCallback } from 'react';
import { useUser } from '../../core/contexts/UserContext';
import { useDialog } from './useDialog';

/**
 * Custom hook for enforcing login requirements on user actions
 * @example
 * const { withLoginCheck, isLoggedIn } = useLoginRequired();
 * const handleAction = () => {
 *   withLoginCheck(() => performAction());
 * };
 */
export const useLoginRequired = () => {
  const { currentUser } = useUser();
  const { openDialog } = useDialog();

  const withLoginCheck = useCallback(
    (action: () => void, errorMessage = 'You need to be signed in to perform this action') => {
      if (!currentUser) {
        openDialog(errorMessage, { redirect: true, title: 'Action Required' });
        return;
      }
      action();
    },
    [currentUser, openDialog]
  );

  return { withLoginCheck, isLoggedIn: !!currentUser };
};
