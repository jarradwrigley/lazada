// utils/toast.ts
import { toast, ToastT } from "sonner";

// Success toast
export const showSuccess = (
  message: string,
  options?: Parameters<typeof toast.success>[1]
) => {
  return toast.success(message, options);
};

// Error toast with error handling
export const showError = (
  error: unknown,
  options?: Parameters<typeof toast.error>[1]
) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "An unexpected error occurred";

  return toast.error(message, options);
};

// Info toast
export const showInfo = (
  message: string,
  options?: Parameters<typeof toast.info>[1]
) => {
  return toast.info(message, options);
};

// Warning toast
export const showWarning = (
  message: string,
  options?: Parameters<typeof toast.warning>[1]
) => {
  return toast.warning(message, options);
};

// Promise toast for async operations
// This signature matches Sonner's toast.promise API
export const showPromise = <T>(
  promise: Promise<T>,
  options: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
    [key: string]: any;
  }
) => {
  return toast.promise(promise, options);
};

// Custom toast with action button
export const showActionToast = (
  message: string,
  action: {
    label: string;
    onClick: () => void;
  },
  options?: Parameters<typeof toast>[1]
) => {
  return toast(message, {
    ...options,
    action,
  });
};

// Dismiss toast by ID
export const dismissToast = (id: string | number) => {
  toast.dismiss(id);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};
