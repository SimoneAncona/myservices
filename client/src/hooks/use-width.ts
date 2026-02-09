import { useEffect, useRef, useState } from "react";

export function useWidth(maxWidth: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const observer = new ResizeObserver(([entry]) => {
      setIsBelow(entry.contentRect.width <= maxWidth);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [maxWidth]);

  return { ref, isBelow };
}