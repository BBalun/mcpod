import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient, trpc, trpcClient } from "./utils/trpc";
import "./global.css";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  Title,
} from "chart.js";
import autocolors from "chartjs-plugin-autocolors";

import Star from "./pages/star";
import { ChakraProvider } from "@chakra-ui/react";
import Search from "./pages/search";
import References from "./pages/references";
import Observations from "./pages/observations";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);
ChartJS.register(autocolors);
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const router = createBrowserRouter([
  {
    path: "/star/:starId",
    element: <Star />,
  },
  {
    path: "/",
    element: <Search />,
  },
  {
    path: "/references/:starId",
    element: <References />,
  },
  {
    path: "/observations/:starId/:reference",
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
