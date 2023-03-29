import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient, trpc, trpcClient } from "./utils/trpc";
import "./global.css";
import Star from "./pages/star";
import { ChakraProvider } from "@chakra-ui/react";
import Search from "./pages/search";
import References from "./pages/references";
import Observations from "./pages/observations";
import LoadingLayout from "./components/LoadingLayout";

const router = createBrowserRouter([
  {
    path: "/star/:starId",
    element: (
      <LoadingLayout>
        <Star />
      </LoadingLayout>
    ),
  },
  {
    path: "/",
    element: <Search />,
  },
  {
    path: "/references/:starId",
    element: (
      <Suspense fallback={<div>Loading suspense</div>}>
        <References />,
      </Suspense>
    ),
  },
  {
    path: "/observations/:starId/:referenceId",
    element: <Observations />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <RouterProvider router={router} />
        </ChakraProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
