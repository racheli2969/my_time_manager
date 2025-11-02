/**
 * useDialog Hook
 * Manages dialog/modal state and actions
 */

import { useState, useCallback } from 'react';
import { DialogState } from '../types';

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const openDialog = useCallback((message: string, options?: { title?: string; redirect?: boolean }) => {
    setDialog({
      message,
      title: options?.title,
      redirect: options?.redirect,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
  }, []);

  return {
    dialog,
    openDialog,
    closeDialog,
  };
};
