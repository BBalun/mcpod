import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../backend";

export type RouterOutput = inferRouterOutputs<AppRouter>;
