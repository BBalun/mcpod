import "./global.css";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient, trpc, trpcClient } from "./utils/trpc";
import Star from "./pages/star";
import { ChakraProvider } from "@chakra-ui/react";
import References from "./pages/references";
import Observations from "./pages/observations";
import LoadingLayout from "./components/LoadingLayout";
import ExportPage from "./pages/export";
import Layout from "./components/Layout";
import Home from "./pages/home";
import Contact from "./pages/contact";

const router = createBrowserRouter([
  {
    path: "/star/:starId",
    element: (
      <Layout>
        <Star />
      </Layout>
    ),
  },
  {
    path: "/references/:starId",
    element: (
      <Layout>
        <References />,
      </Layout>
    ),
  },
  {
    path: "/observations/:starId/:referenceId",
    element: (
      <Layout>
        <Observations />
      </Layout>
    ),
  },
  {
    path: "/export",
    element: (
      <Layout>
        <ExportPage />
      </Layout>
    ),
  },
  {
    path: "/contact",
    element: (
      <Layout>
        <Contact />
      </Layout>
    ),
  },
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
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
