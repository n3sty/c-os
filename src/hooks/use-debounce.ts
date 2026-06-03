import { useCallback, useRef } from "react";

export function useDebounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
): (...args: T) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        fn(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn, delay],
  );
}
