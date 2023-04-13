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
import ExportPage from "./pages/export";
import Layout from "./components/Layout";
import Home from "./pages/home";
import Contact from "./pages/contact";
import ErrorPage from "./pages/error-page";

const router = createBrowserRouter([
  {
    path: "/star/:starId",
    element: <Star />,
  },
  {
    path: "/references/:starId",
    element: <References />,
  },
  {
    path: "/observations/:starId/:referenceId",
    element: <Observations />,
  },
  {
    path: "/export",
    element: <ExportPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <Layout>
            <RouterProvider router={router} />
          </Layout>
        </ChakraProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>
);
