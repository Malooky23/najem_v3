/* VERSION 3 */
import { useState, useEffect, useCallback, useRef } from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobileTEST() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }, [query])

  // Initialize with a consistent value for SSR and initial client render
  const [matches, setMatches] = useState<boolean>(false)
  const listenerRef = useRef<() => void | undefined>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Set the correct initial value on the client after mount
    const initialMatches = getMatches();
    if (matches !== initialMatches) {
        setMatches(initialMatches);
    }

    const media = window.matchMedia(query)

    listenerRef.current = () => {
      const currentMatches = getMatches();
      // Only update state if the value has actually changed
      setMatches(prevMatches => prevMatches !== currentMatches ? currentMatches : prevMatches);
    };

    const listener = listenerRef.current;

    // Add event listener
    media.addEventListener('change', listener);

    // Clean up event listener
    return () => media.removeEventListener('change', listener);
    // Dependencies: query and getMatches. matches is removed to avoid re-running effect on every match change.
  }, [query, getMatches]); 

  return matches
}

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange)
//   }, [])

//   return !!isMobile
// }
