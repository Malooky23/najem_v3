/* VERSION 3 */
import { useState, useEffect, useCallback, useRef, use } from 'react'

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

  const [matches, setMatches] = useState(getMatches)
  const listenerRef = useRef<() => void | undefined>(null); // useRef for listener

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const media = window.matchMedia(query)

    // Store listener in ref to avoid recreating it on every render
    listenerRef.current = () => {
      const currentMatches = getMatches();
      if (matches !== currentMatches) { // Double check before state update
        setMatches(currentMatches);
      }
    };

    const listener = listenerRef.current;

    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query, getMatches, matches]); // matches is now kept as dependency for the double check

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
