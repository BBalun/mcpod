import { initTRPC } from "@trpc/server";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import { fetchHdNumber } from "./services/fetchHdNumber";

// TODO: own file
const prisma = new PrismaClient();

// TODO: own file
const t = initTRPC.create();

// TODO: own file
const appRouter = t.router({
  getObservations: t.procedure
    .input(
      z.object({
        hdNumber: z.number(),
        reference: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { hdNumber, reference } = input;
      const data = await prisma.observation.findMany({
        where: {
          hdNumber,
          reference,
        },
      });
      return data;
    }),
  getReferences: t.procedure
    .input(
      z.object({
        hdNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { hdNumber } = input;
      const data = await prisma.reference.findMany({
        where: {
          hdNumber,
        },
      });
      return data;
    }),
  getPhasedData: t.procedure
    .input(
      z.object({
        hdNumber: z.number().positive(),
        filters: z.array(z.string().trim().min(0)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        phase: z.number(),
        period: z.number(),
        references: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      // TODO: rename phase to epoch
      const { hdNumber, filters, startDate, endDate, phase, period, references } = input;
      const data = await getData(hdNumber, filters, startDate, endDate, references);

      return groupByFilterCode(
        data.map(({ julianDate, filter, magnitude }) => ({
          filter,
          magnitude,
          phase: calculatePhase(julianDate.toNumber(), period, phase),
        }))
        // filters
      );
    }),
  getPhaseAndEpoch: t.procedure.input(z.object({ starId: z.string().min(1) })).query(async ({ input }) => {
    const { starId } = input;

    const data = await prisma.element.findFirst({
      where: {
        // TODO: rename model
        hdNumber: parseInt(starId),
      },
    });

    if (data) {
      return {
        period: data?.period?.toString() ?? null,
        epoch: data?.epoch?.toString() ?? null,
      };
    }

    const ephemerids = await fetchEphemerids("HD " + starId);
    if (ephemerids?.epoch) {
      const epoch = z.string().trim().safeParse(ephemerids.epoch);
      if (epoch.success) {
        ephemerids.epoch = (parseFloat(epoch.data) - 2_400_000).toFixed(2);
      }
    }
    return ephemerids;
  }),
  getData: t.procedure
    .input(
      z.object({
        hdNumber: z.number().positive(),
        filters: z.array(z.string().trim().min(0)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        references: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const { hdNumber, filters, startDate, endDate, references } = input;
      const data = await getData(hdNumber, filters, startDate, endDate, references);
      // return groupByFilterCode(data, filters);
      return groupByFilterCode(data);
    }),
  getStarHdNumber: t.procedure.input(z.string().min(1)).query(async ({ input }) => {
    const hdNumberRes = await fetchHdNumber(input);
    if (hdNumberRes.error) {
      return hdNumberRes;
    }
    const hdNumber = hdNumberRes.data;

    if (
      await prisma.catalog.findFirst({
        where: {
          hdNumber,
        },
      })
    ) {
      return hdNumberRes;
    }

    return {
      data: null,
      error: {
        msg: `Failed to find ${hdNumber} in a database`,
      },
    };
  }),
});

async function getData(
  hdNumber: number,
  filters: string[],
  startDate: number | undefined,
  endDate: number | undefined,
  references: string[] | undefined
) {
  const data = await prisma.catalog.findMany({
    select: {
      hdNumber: true,
      filter: true,
      magnitude: true,
      julianDate: true,
    },
    where: {
      hdNumber,
      magnitude: {
        not: null,
      },
      filter: filters.length ? { in: filters } : undefined,
      julianDate: {
        gte: startDate,
        lte: endDate,
      },
      reference: references?.length ? { in: references } : undefined,
    },
  });
  type DataT = typeof data[0];
  type DataWithMagnitudeRequired = Array<{ [K in keyof DataT]: NonNullable<DataT[K]> }>;
  return data as DataWithMagnitudeRequired;
}

function groupByFilterCode<T extends { filter: string }>(data: T[], filters: string[] = []) {
  const res = filters.reduce((map, filter) => {
    map[filter] = [];
    return map;
  }, {} as Record<string, typeof data>);

  return data.reduce((map, catalog) => {
    const data = map[catalog.filter];
    if (data) {
      data.push(catalog);
    } else {
      map[catalog.filter] = [catalog];
    }
    return map;
  }, res);
}

/**
 * Calculate Phase
 * @param date Julian date for which a phase should be calculated
 * @param period Period in days
 * @param epoch Julian date used as a reference point/ offset for phase calculation
 */
function calculatePhase(date: number, period: number, epoch: number) {
  // $phase = ($jd - $epoch) / $period;
  // $phase -= floor($phase);
  // return number_format(round($phase, 3), 3, '.', '');
  let phase = (date - epoch) / period;
  phase -= Math.floor(phase);
  while (phase < 0) {
    phase += period;
  }
  return phase;
}

async function fetchEphemerids(starId: string) {
  const url = new URL("https://www.aavso.org/vsx/index.php?view=api.object&format=json");
  url.searchParams.append("ident", starId);

  const res = await fetch(url);
  if (res.status !== 200) {
    console.error(`Failed to fetch data from aavso. Return status: ${res.status}`);
    console.error(`Body: ${await res.text()}`);
    return null;
  }

  const body = await res.json();

  const period = (body?.VSXObject?.Period ?? null) as string | null;
  const epoch = (body?.VSXObject?.Epoch ?? null) as string | null;

  return {
    period,
    epoch,
  };
}

async function main() {
  const app = express();

  app.use(cors());
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
