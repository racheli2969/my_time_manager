/**
 * useFormState Hook
 * Generic form state management hook
 */

import { useState, useCallback } from 'react';

export const useFormState = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);

  const updateField = useCallback((field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    updateField,
    updateMultiple,
    reset,
  };
};
