// "use client";

// import { SessionProvider } from "next-auth/react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'
// import { PostHogProvider } from "./posthogProvider";

// const queryClient = new QueryClient();
// export function Providers({ children }: { children: React.ReactNode }) {

//   return (
//     <QueryClientProvider client={queryClient}>
//       <SessionProvider>
//         {/* <PostHogProvider> */}
//         {children}
//         {/* </PostHogProvider> */}
//         <ReactQueryDevtools initialIsOpen={false} />
//       </SessionProvider>
//     </QueryClientProvider>
//   );
// }


// app/providers.tsx (or wherever your Providers component is located)
"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { Persister } from '@tanstack/react-query-persist-client'; // <-- CORRECTED IMPORT for the TYPE

// import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'; // You can keep this if needed
import { useState, useEffect, useRef } from "react";

// Create the QueryClient instance outside the component to ensure it's stable
// and not re-created on every render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // gcTime (formerly cacheTime) for in-memory cache.
      // Persisted cache has its own `maxAge`.
      // It's often good to set gcTime to a longer duration when persisting.
      gcTime: 1000 * 60 * 60 * 24, // 24 hours for in-memory cache
    },
  },
});

// If you are using broadcastQueryClient, you would call it here:
// if (typeof window !== 'undefined') { // Ensure it runs only on client
//   broadcastQueryClient({
//     queryClient,
//     broadcastChannel: 'my-app-queries', // Choose a unique channel name
//   });
// }

export function Providers({ children }: { children: React.ReactNode }) {
  // State to hold the persister. Initialize to undefined.
  // We only create the persister on the client-side.
  const [ localStoragePersister, setLocalStoragePersister ] = useState<Persister | undefined>(undefined);
  const isMounted = useRef(false); // To ensure persister is created only once after mount

  useEffect(() => {
    // This effect runs only on the client after initial mount
    if (typeof window !== 'undefined' && !isMounted.current) {
      const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'NAJEM_CACHE', // Optional: custom key for localStorage
        // throttleTime: 1000, // Optional: to avoid too frequent writes
      });
      setLocalStoragePersister(persister);
      isMounted.current = true;
    }
  }, []); // Empty dependency array ensures this runs once on client mount

  // If the persister is not yet created (e.g., on the server or during the very first client render cycle),
  // fall back to the standard QueryClientProvider without persistence.
  // This ensures your app works fine during SSR and before the client-side effect runs.
  if (!localStoragePersister) {
    return (
      <TanstackQueryClientProvider client={queryClient}>
        <SessionProvider>
          {/* <PostHogProvider> */}
          {children}
          {/* </PostHogProvider> */}
          <ReactQueryDevtools initialIsOpen={false}/>
        </SessionProvider>
      </TanstackQueryClientProvider>
    );
  }

  // Once the localStoragePersister is available on the client, use PersistQueryClientProvider
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister, // We've ensured it's defined by now on the client
        /**
         * How long to keep the persisted cache.
         * If a query is older than this, it will be discarded from persisted storage.
         * This is independent of `staleTime` or `gcTime` of individual queries.
         */
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        /**
         * A "buster" string. If you change this, all persisted data will be invalidated.
         * Useful for when you make breaking changes to your data structures.
         * Consider using your app version here from an environment variable.
         */
        buster: process.env.NEXT_PUBLIC_CACHE_BUSTER, // Change this to invalidate cache
        // You can also add serialize and deserialize functions if you need custom logic,
        // but for simple JSON data, the defaults are usually fine.
      }}
      onSuccess={() => {
        // console.log('React Query cache restored from localStorage.');
        // If you have paused mutations, you can resume them here
        // queryClient.resumePausedMutations();
      }}
    >
      <SessionProvider>
        {/* <PostHogProvider> */}
        {children}
        {/* </PostHogProvider> */}
        <ReactQueryDevtools initialIsOpen={false}/>
      </SessionProvider>
    </PersistQueryClientProvider>
  );
}