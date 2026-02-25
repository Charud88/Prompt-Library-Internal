"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // Ensure QueryClient is created only once on the client
    const [client] = useState(() => queryClient);

    return (
        <QueryClientProvider client={client}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
