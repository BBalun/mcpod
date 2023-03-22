import { initTRPC, TRPCError } from "@trpc/server";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import { fetchStarIds } from "./services/fetchHdNumber";

// TODO: own file
const prisma = new PrismaClient();

// TODO: own file
const t = initTRPC.create();

async function getEphemerids(starIds: string[]) {
  if (starIds.length === 0) {
    console.error("getEphemerids function requires parameter 'starIds' to be non empty");
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "getEphemerids function requires parameter 'starIds' to be non empty",
    });
  }

  const data = await prisma.ephemeris.findFirst({
    where: {
      starId: {
        in: starIds,
      },
    },
  });

  if (data) {
    return {
      period: data?.period?.toNumber() ?? null,
      epoch: data?.epoch?.toNumber() ?? null,
    };
  }

  // Which starIds should be used?
  // For now, use primarily HD number, secondarily HIP number, tertiary TYC number, and lastly any identifier that comes next
  const starId = starIds.find((id) => id.startsWith("HD") || id.startsWith("HIP") || id.startsWith("TYC") || true)!;

  const ephemerids = await fetchEphemerids(starId);
  if (ephemerids?.epoch) {
    ephemerids.epoch = ephemerids.epoch - 2_400_000;
  }
  return ephemerids;
}

// TODO: own file
const appRouter = t.router({
  getStarData: t.procedure
    .input(
      z.object({
        starId: z.string().min(1),
        filters: z.array(z.string().trim().min(0)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        referenceIds: z.array(z.string().min(1)).optional(),
      })
    )
    .query(async ({ input }) => {
      const { starId, filters, startDate, endDate, referenceIds } = input;
      const starIds = await fetchStarIds(starId);

      const starIdsWithInput = starIds.includes(starId) ? starIds : [...starIds, starId];

      const starData = await getData(starIdsWithInput, filters, startDate, endDate, referenceIds);
      const chartData = groupByFilterCode(starData); // data for main chart

      const ephemerids = await getEphemerids(starIdsWithInput); // epoch and period

      let phasedLightCurveChartData; // second chart data
      if (ephemerids && ephemerids.period !== null && ephemerids.epoch !== null) {
        phasedLightCurveChartData = groupByFilterCode(
          starData.map(({ julianDate, filter, magnitude }) => ({
            filter,
            magnitude: magnitude.toNumber(),
            phase: calculatePhase(julianDate.toNumber(), ephemerids.period!, ephemerids.epoch!), // ! required, because TS is making stuff up
          }))
        );
      }

      return {
        chartData,
        ephemerids,
        phasedLightCurveChartData: phasedLightCurveChartData ?? null,
        identifiers: starIds,
      };
    }),
  getObservations: t.procedure
    .input(
      z.object({
        starId: z.string().min(1),
        referenceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { starId, referenceId } = input;
      const data = await prisma.observation.findMany({
        where: {
          starId,
          referenceId,
        },
      });
      return data;
    }),
  getReferences: t.procedure
    .input(
      z.object({
        starId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { starId } = input;
      const data = await prisma.reference.findMany({
        where: {
          starId,
        },
      });
      return data;
    }),
  getPhasedData: t.procedure
    .input(
      z.object({
        starIds: z.array(z.string().min(1)),
        filters: z.array(z.string().trim().min(0)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        epoch: z.number(),
        period: z.number(),
        referenceIds: z.array(z.string().min(1)).optional(),
      })
    )
    .query(async ({ input }) => {
      // TODO: using starIds (instead of starId - singular) is not a nice solution
      const { starIds, filters, startDate, endDate, epoch, period, referenceIds } = input;
      const data = await getData(starIds, filters, startDate, endDate, referenceIds);

      return groupByFilterCode(
        data.map(({ julianDate, filter, magnitude }) => ({
          filter,
          magnitude: magnitude.toNumber(),
          phase: calculatePhase(julianDate.toNumber(), period, epoch),
        }))
      );
    }),
  // getPhaseAndEpoch: t.procedure.input(z.object({ starId: z.string().min(1) })).query(async ({ input }) => {
  //   const { starId } = input;

  //   const data = await prisma.ephemeris.findFirst({
  //     where: {
  //       starId,
  //     },
  //   });

  //   if (data) {
  //     return {
  //       period: data?.period?.toString() ?? null,
  //       epoch: data?.epoch?.toString() ?? null,
  //     };
  //   }

  //   const ephemerids = await fetchEphemerids(starId);
  //   if (ephemerids?.epoch) {
  //     const epoch = z.string().trim().transform(parseFloat).safeParse(ephemerids.epoch);
  //     if (epoch.success) {
  //       ephemerids.epoch = (epoch.data - 2_400_000).toFixed(2);
  //     }
  //   }
  //   return ephemerids;
  // }),
  // getData: t.procedure
  //   .input(
  //     z.object({
  //       starId: z.string().min(1),
  //       filters: z.array(z.string().trim().min(0)),
  //       startDate: z.number().optional(),
  //       endDate: z.number().optional(),
  //       referenceIds: z.array(z.string().min(1)).optional(),
  //     })
  //   )
  //   .query(async ({ input }) => {
  //     const { starId, filters, startDate, endDate, referenceIds } = input;
  //     const data = await getData(starId, filters, startDate, endDate, referenceIds);
  //     // return groupByFilterCode(data, filters);
  //     return groupByFilterCode(data);
  //   }),
});

async function getData(
  starIds: string[],
  filters: string[],
  startDate: number | undefined,
  endDate: number | undefined,
  referenceIds: string[] | undefined
) {
  const data = await prisma.catalog.findMany({
    select: {
      starId: true,
      filter: true,
      magnitude: true,
      julianDate: true,
    },
    where: {
      starId: {
        in: starIds,
      },
      magnitude: {
        not: null,
      },
      filter: filters.length ? { in: filters } : undefined,
      julianDate: {
        gte: startDate,
        lte: endDate,
      },
      referenceId: referenceIds?.length ? { in: referenceIds } : undefined,
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
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch data from aavso. Return status: ${res.status}`,
    });
  }

  const body = await res.json();

  const periodStr = (body?.VSXObject?.Period ?? null) as string | null;
  const epochStr = (body?.VSXObject?.Epoch ?? null) as string | null;

  const period = periodStr ? Number(periodStr) : null;
  const epoch = epochStr ? Number(epochStr) : null;

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
