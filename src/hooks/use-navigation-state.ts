import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * A hook to track navigation state and control refetching behavior
 * @param queryKeys Array of query keys to manage
 */
export function useNavigationState(queryKeys: string[] = []) {
  const queryClient = useQueryClient();
  const isNavigatingRef = useRef(false);
  const visitedPagesRef = useRef(new Set<string>());
  const currentPathRef = useRef('');

  useEffect(() => {
    // If we're in a browser environment
    if (typeof window !== 'undefined') {
      currentPathRef.current = window.location.pathname;
      // Fix the syntax error: change visitedPagesRef.useRef.add to visitedPagesRef.current.add
      visitedPagesRef.current.add(currentPathRef.current);

      // Function to handle navigation events
      const handleBeforeNavigate = () => {
        isNavigatingRef.current = true;
      };

      // Function to handle returning to the page
      const handleReturnToPage = () => {
        // If we're returning to a previously visited page,
        // we don't want to refetch the data automatically
        if (isNavigatingRef.current && visitedPagesRef.current.has(window.location.pathname)) {
          console.log('Returned to previously visited page, disabling automatic refetches');
          
          // Disable automatic refetching for the specified query keys
          queryKeys.forEach(key => {
            queryClient.setQueryDefaults([key], {
              refetchOnMount: false,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false
            });
          });
          
          // Reset after a short delay to not affect future navigation
          setTimeout(() => {
            queryKeys.forEach(key => {
              queryClient.setQueryDefaults([key], {
                refetchOnMount: undefined,
                refetchOnWindowFocus: undefined,
                refetchOnReconnect: undefined
              });
            });
          }, 1000);
        }
        
        isNavigatingRef.current = false;
      };

      // Listen for navigation events
      window.addEventListener('beforeunload', handleBeforeNavigate);
      window.addEventListener('popstate', handleBeforeNavigate);
      
      // These events don't exist by default in the browser, so we need to add them differently
      // or remove them if they're not being used
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function() {
        handleBeforeNavigate();
        return originalPushState.apply(this, arguments as any);
      };
      
      window.history.replaceState = function() {
        handleBeforeNavigate();
        return originalReplaceState.apply(this, arguments as any);
      };
      
      // Listen for returning to the page
      window.addEventListener('focus', handleReturnToPage);
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          handleReturnToPage();
        }
      });
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeNavigate);
        window.removeEventListener('popstate', handleBeforeNavigate);
        window.addEventListener('focus', handleReturnToPage);
        window.removeEventListener('visibilitychange', handleReturnToPage);
        
        // Restore original history methods
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, [queryClient, queryKeys]);
}
