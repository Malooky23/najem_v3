"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'
import { PostHogProvider } from "./posthogProvider";

const queryClient = new QueryClient();
export function Providers({ children }: { children: React.ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {/* <PostHogProvider> */}
        {children}
        {/* </PostHogProvider> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </QueryClientProvider>
  );
}


