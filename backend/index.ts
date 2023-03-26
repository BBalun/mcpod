import { initTRPC, TRPCError } from "@trpc/server";
import express from "express";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import { fetchObjectId, fetchObjectIds, fetchStarIds } from "./services/fetchHdNumber";

// TODO: own file
const prisma = new PrismaClient();

// TODO: own file
const t = initTRPC.create();

async function getEphemerids(starId: number) {
  const data = await prisma.ephemeris.findFirst({
    where: {
      starId,
    },
  });

  if (data) {
    return {
      period: data?.period?.toNumber() ?? null,
      epoch: data?.epoch?.toNumber() ?? null,
    };
  }

  const identifier = await prisma.identifier.findUnique({
    where: {
      starId,
    },
  });

  if (!identifier) {
    console.error(`getEphemerids failed. Parameter starId ${starId} is not present in identifiers table`);
    return {
      period: null,
      epoch: null,
    };
  }

  // TODO: mainId is probably enough
  const ephemerids = await fetchEphemerids(identifier.hip ?? identifier.tyc ?? identifier.mainId);
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
        starId: z.number(),
        filters: z.array(z.string().trim().min(0)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        referenceIds: z.array(z.string().min(1)).optional(),
        ephemerids: z
          .object({
            period: z.number().nullable(),
            epoch: z.number().nullable(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const { starId, filters, startDate, endDate, referenceIds, ephemerids } = input;

      const starData = await getData(starId, filters, startDate, endDate, referenceIds);
      const chartData = groupByFilterCode(starData); // data for main chart

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
        phasedLightCurveChartData: phasedLightCurveChartData ?? null,
      };
    }),
  getEphemerids: t.procedure.input(z.number()).query(async ({ input: starId }) => {
    return await getEphemerids(starId);
  }),
  getObservations: t.procedure
    .input(
      z.object({
        starId: z.number(),
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
        starId: z.number(),
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
  getData: t.procedure
    .input(
      z.object({
        starId: z.number(),
        filters: z.array(z.string().trim().min(1)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        referenceIds: z.array(z.string().min(1)).optional(),
      })
    )
    .query(async ({ input }) => {
      const { starId, filters, startDate, endDate, referenceIds } = input;
      const data = await getData(starId, filters, startDate, endDate, referenceIds);

      return groupByFilterCode(data);
    }),
  getPhasedData: t.procedure
    .input(
      z.object({
        starId: z.number(),
        filters: z.array(z.string().trim().min(1)),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        referenceIds: z.array(z.string().min(1)).optional(),
        period: z.number(),
        epoch: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { starId, filters, startDate, endDate, epoch, period, referenceIds } = input;
      const data = await getData(starId, filters, startDate, endDate, referenceIds);

      const phasedData = data.map(({ julianDate, filter, magnitude }) => ({
        filter,
        magnitude: magnitude.toNumber(),
        phase: calculatePhase(julianDate.toNumber(), period, epoch),
      }));

      return groupByFilterCode(phasedData);
    }),
  search: t.procedure.input(z.string().min(1)).query(async ({ input }) => {
    const starIds = await fetchObjectIds(input);
    if (!starIds) {
      return null;
    }

    const identifier = await prisma.identifier.findUnique({
      where: {
        starId: starIds.oid,
      },
    });

    // Make sure that identifier is in the DB
    if (!identifier) {
      await prisma.identifier.create({
        data: {
          starId: starIds.oid,
          mainId: starIds.mainId,
          hip: starIds.hip,
          tyc: starIds.tyc,
        },
      });
    }

    return starIds.oid;
  }),
  getMainId: t.procedure.input(z.object({ starId: z.number() })).query(async ({ input }) => {
    const { starId } = input;
    const identifiers = await prisma.identifier.findUnique({
      where: {
        starId,
      },
    });

    return identifiers?.mainId ?? null;
  }),
});

async function getData(
  starId: number,
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
      starId,
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
