/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

// Our hook
export default function useDebounce(value: any, delay: any) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      return () => {
        clearTimeout(handler);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  return debouncedValue;
}
