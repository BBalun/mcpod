import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { findIdentifierByStarId, getCount as getIdentifierCount } from "../data/identifierRepository";
import { findObservations } from "../data/observationRepository";
import { getCount as getCatalogCount } from "../data/catalogRepository";
import { getData, getPhasedData } from "../services/catalogService";
import { getEphemerids } from "../services/ephemeridsService";
import { exportToCsv } from "../services/exportService";
import { getReferences } from "../services/referenceService";
import { search } from "../services/searchService";
import { t } from "./trpc";
import { isInternalServerError } from "../exceptions/InternalServerError";
import { readFile } from "fs/promises";
import { pathToDataDir } from "../constants";

const procedure = t.procedure.use(
  t.middleware(({ next }) => {
    try {
      return next();
    } catch (e) {
      if (isInternalServerError(e)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: e.message,
          cause: e.cause,
        });
      }
      throw e;
    }
  })
);

export const appRouter = t.router({
  getEphemerids: procedure.input(z.number()).query(async ({ input: starId }) => {
    return await getEphemerids(starId);
  }),
  getObservations: procedure
    .input(
      z.object({
        starId: z.number(),
        referenceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { starId, referenceId } = input;
      return await findObservations(starId, referenceId);
    }),
  getReferences: procedure
    .input(
      z.object({
        starId: z.number(),
        filters: z.array(z.string()).optional(),
      })
    )
    .query(async ({ input }) => {
      const { starId, filters } = input;
      return await getReferences(starId, filters);
    }),
  getData: procedure
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
      return await getData(starId, filters, startDate, endDate, referenceIds);
    }),
  getPhasedData: procedure
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
      return await getPhasedData(starId, filters, startDate, endDate, referenceIds, period, epoch);
    }),
  search: procedure.input(z.string().min(1)).query(async ({ input }) => {
    return await search(input);
  }),
  getMainId: procedure.input(z.object({ starId: z.number() })).query(async ({ input }) => {
    const { starId } = input;
    const identifiers = await findIdentifierByStarId(starId);

    if (!identifiers?.mainId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Failed to get main id for star " + starId,
      });
    }

    return identifiers.mainId;
  }),
  exportDataToCsv: procedure
    .input(
      z.object({
        starIds: z.array(z.number()).min(1).optional(),
        filters: z.array(z.string().trim().min(1)).min(1).optional(),
        startDate: z.number().optional(),
        endDate: z.number().optional(),
        // referenceIds: z.array(z.string().min(1)).optional(),
      })
    )
    .query(async ({ input }) => {
      return await exportToCsv(input);
    }),
  getHomepageStatistics: procedure.input(z.object({}).optional()).query(async () => {
    const [numOfMeasurements, numOfStars] = await Promise.all([getCatalogCount(), getIdentifierCount()]);

    return {
      numOfMeasurements,
      numOfStars,
    };
  }),
  getSystems: procedure.input(z.object({}).optional()).query(async () => {
    try {
      const json = await readFile(pathToDataDir + "/systems.json", { encoding: "utf-8" });
      return JSON.parse(json);
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load systems.json file",
      });
    }
  }),
});
