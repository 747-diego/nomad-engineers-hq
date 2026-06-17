"use client";

import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { pushToast } from "@/lib/toast-bus";

// TanStack Query wraps all Supabase data fetching + caching.
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        // Any mutation that fails without its own onError surfaces a toast,
        // so writes never fail silently anywhere in the app.
        mutationCache: new MutationCache({
          onError: (error) => {
            const message =
              error instanceof Error ? error.message : "Something went wrong";
            pushToast(message);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
