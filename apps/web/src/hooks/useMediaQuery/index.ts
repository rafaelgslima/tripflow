import { useEffect, useRef, useState } from "react";

export function useMediaQuery(query: string): boolean {
  // Default to mobile-first (false = not desktop)
  const [matches, setMatches] = useState(false);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Only set initial value on first mount, don't update from media query result
    // This prevents iOS auto-zoom caused by layout shifts during hydration
    if (isInitialRender.current) {
      isInitialRender.current = false;
      // Don't call setMatches here - keep the mobile-first default
    }

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
