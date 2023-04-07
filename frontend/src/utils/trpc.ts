import { QueryClient } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../backend/";

// @ts-ignore
export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const trpcClient = trpc.createClient({
  links: [
    // @ts-ignore
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_ENDPOINT ?? "/trpc", // has to be prefixed with VITE_ otherwise it won't be included in client side bundle
    }),
  ],
});
