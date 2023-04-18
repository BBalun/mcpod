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

type Result = {
  star: string;
  referenceId: string;
  julianDate: number;
  filter: string;
  magnitude: number;
  magErr: number | undefined;
};

export async function getDataForExport(
  starIds: number[] | undefined,
  filters: string[] | undefined,
  startDate: number | undefined,
  endDate: number | undefined
): Promise<Result[]> {
  const data = await prisma.catalog.findMany({
    include: {
      star: true,
    },
    where: {
      starId: starIds ? { in: starIds } : undefined,
      filter: filters ? { in: filters } : undefined,
      julianDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return data.map((catalog) => ({
    star: catalog.star.mainId,
    referenceId: catalog.referenceId,
    julianDate: catalog.julianDate.toNumber(),
    filter: catalog.filter,
    magnitude: catalog.magnitude.toNumber(),
    magErr: catalog.magErr?.toNumber(),
  }));
}

export function getCount() {
  return prisma.catalog.count();
}
