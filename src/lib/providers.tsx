"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  broadcastQueryClient({
    queryClient,
    broadcastChannel: 'najem-v3-sync', // custom channel name
  });


  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {/* <ReactQueryDevtools initialIsOpen={true} /> */}
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
