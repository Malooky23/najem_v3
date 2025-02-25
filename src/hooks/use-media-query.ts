// // // /* VERSION 1 */
// import { useState, useEffect } from 'react'

// export function useMediaQuery(query: string): boolean {
//   const [matches, setMatches] = useState(false)

//   useEffect(() => {
//     const media = window.matchMedia(query)

//     // Set initial value
//     setMatches(media.matches)

//     // Create event listener
//     const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

//     // Add listener
//     media.addEventListener('change', listener)

//     // Clean up
//     return () => media.removeEventListener('change', listener)
//   }, [query])

//   return matches
// }

// // /* VERSION 2 */
// // // import { useState, useEffect, useCallback } from 'react'

// // // export function useMediaQuery(query: string): boolean {
// // //   // For SSR, default to false during initial render
// // //   const getMatches = useCallback(() => {
// // //     // Avoid accessing window during SSR
// // //     if (typeof window !== 'undefined') {
// // //       return window.matchMedia(query).matches
// // //     }
// // //     return false
// // //   }, [query])

// // //   const [matches, setMatches] = useState(getMatches)

// // //   useEffect(() => {
// // //     if (typeof window === 'undefined') return undefined

// // //     const media = window.matchMedia(query)

// // //     // Update matches state only if it changed
// // //     if (media.matches !== matches) {
// // //       setMatches(media.matches)
// // //     }

// // //     // Use memoized listener to avoid creating new function on each render
// // //     const listener = () => setMatches(media.matches)

// // //     // Add listener
// // //     media.addEventListener('change', listener)

// // //     // Clean up
// // //     return () => media.removeEventListener('change', listener)
// // //   }, [query, matches, getMatches])

// // //   return matches
// // // }


/* VERSION 3 */
import { useState, useEffect, useCallback, useRef } from 'react'

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
