import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./api/router";
import { prisma } from "./database/prisma";

async function main() {
  const app = express();

  app.use(
    "/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
    })
  );

  app.listen(3000, () => {
    console.log("App started on port 3000");
  });
}

try {
  main();
} finally {
  prisma.$disconnect();
}

export type AppRouter = typeof appRouter;
