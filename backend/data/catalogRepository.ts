import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";

export async function getData(
  starId: number,
  filters: string[],
  startDate: number | undefined,
  endDate: number | undefined,
  referenceIds: string[] | undefined
) {
  const data = await prisma.catalog.findMany({
    select: {
      magErr: true,
      referenceId: true,
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

  return data.map((x) => ({
    filter: x.filter,
    magnitude: x.magnitude!.toNumber(),
    julianDate: x.julianDate.toNumber(),
    magErr: x.magErr?.toNumber(),
    referenceId: x.referenceId,
  }));
}

export async function findUniqueReferenceIds(starId: number, filters: string[]) {
  const data = await prisma.catalog.findMany({
    select: {
      referenceId: true,
    },
    where: {
      starId,
      filter: filters ? { in: filters } : undefined,
    },
    distinct: "referenceId",
  });
  return data.map((r) => r.referenceId);
}

export function createCatalogs(
  catalogs: Array<{
    filter: string;
    starId: number;
    referenceId: string;
    julianDate: number;
    magnitude: number;
    magErr: number;
  }>
) {
  return prisma.catalog.createMany({
    data: catalogs,
  });
}

export async function getDataForExport(
  starIds: number[] | undefined,
  filters: string[] | undefined,
  startDate: number | undefined,
  endDate: number | undefined
) {
  type Result = {
    star: string;
    referenceId: string;
    julianDate: number;
    filter: string;
    magnitude: number;
    magErr: number | undefined;
  };

  const sql = Prisma.sql`
    SELECT coalesce("Identifier"."mainId", "Identifier"."starId"::TEXT) as "star", "referenceId", "julianDate", "filter", "magnitude", "magErr"
    FROM "Catalog" JOIN "Identifier" ON "Catalog"."starId" = "Identifier"."starId"
    WHERE 1=1
    ${starIds ? Prisma.sql`AND "Catalog"."starId" IN (${Prisma.join(starIds)})` : Prisma.empty} 
    ${filters ? Prisma.sql`AND "Catalog"."filter" IN (${Prisma.join(filters)})` : Prisma.empty}
    ${startDate !== undefined ? Prisma.sql`AND "Catalog"."julianDate" >= ${startDate}` : Prisma.empty}
    ${endDate !== undefined ? Prisma.sql`AND "Catalog"."julianDate" <= ${endDate}` : Prisma.empty}
  `;

  return await prisma.$queryRaw<Result[]>(sql);
}

export function getCount() {
  return prisma.catalog.count();
}
