import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../backend";

// @ts-ignore
export type RouterOutput = inferRouterOutputs<AppRouter>;
