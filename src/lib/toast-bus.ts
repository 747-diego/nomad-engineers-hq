// Tiny bridge so non-React code (the TanStack Query MutationCache) can raise
// toasts. ToastProvider registers its handler on mount.
type ToastHandler = (message: string) => void;

let handler: ToastHandler | null = null;

export function setToastHandler(fn: ToastHandler | null) {
  handler = fn;
}

export function pushToast(message: string) {
  handler?.(message);
}
