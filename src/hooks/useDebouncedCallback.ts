import { useRef, useCallback } from "react";

export function useDebouncedCallback<T extends (...args: unknown[]) => Promise<unknown>>(
  callback: T,
  delayMs: number = 300
): (...args: Parameters<T>) => Promise<void> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingRef = useRef(false);

  return useCallback(
    async (...args: Parameters<T>): Promise<void> => {
      if (isLoadingRef.current) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        isLoadingRef.current = true;
        try {
          await callback(...args);
        } finally {
          isLoadingRef.current = false;
        }
      }, delayMs);
    },
    [callback, delayMs]
  );
}
