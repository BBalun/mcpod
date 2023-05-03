import "./global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient, trpc, trpcClient } from "./utils/trpc";
import Star from "./pages/star";
import { ChakraProvider } from "@chakra-ui/react";
import References from "./pages/references";
import Observations from "./pages/observations";
import ExportPage from "./pages/export";
import Layout from "./components/Layout";
import Home from "./pages/home";
import Contact from "./pages/contact";
import ErrorPage from "./pages/error-page";
import Systems from "./pages/systems";

const router = createBrowserRouter(
  [
    {
      path: "/star/:starId",
      element: withLayout(<Star />),
    },
    {
      path: "/references/:starId",
      element: withLayout(<References />),
    },
    {
      path: "/observations/:starId/:referenceId",
      element: withLayout(<Observations />),
    },
    {
      path: "/export",
      element: withLayout(<ExportPage />),
    },
    {
      path: "/contact",
      element: withLayout(<Contact />),
    },
    {
      path: "/systems",
      element: withLayout(<Systems />),
    },
    {
      path: "/",
      element: withLayout(<Home />),
    },
  ].map((route) => ({ ...route, errorElement: withLayout(<ErrorPage />) }))
);

function withLayout(component: React.ReactNode) {
  return <Layout>{component}</Layout>;
}

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
