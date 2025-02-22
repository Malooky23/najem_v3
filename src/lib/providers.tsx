"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient  = new QueryClient();


  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </SessionProvider>
    </QueryClientProvider>
  );
}
