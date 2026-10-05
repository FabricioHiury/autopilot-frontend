import { useState, useCallback } from 'react';

interface AlertOptions {
  title?: string;
  message: string;
  variant?: 'info' | 'error' | 'success' | 'warning';
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function useDialog() {
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { onConfirm: () => void }) | null
  >(null);

  const showAlert = useCallback(
    (options: AlertOptions) => {
      return new Promise<void>((resolve) => {
        setAlertState({ ...options });
        const interval = setInterval(() => {
          if (!alertState) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });
    },
    [alertState],
  );

  const showConfirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        ...options,
        onConfirm: () => {
          resolve(true);
          setConfirmState(null);
        },
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  return {
    alertState,
    confirmState,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm,
  };
}
