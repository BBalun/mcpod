import { prisma } from "../database/prisma";

export async function findReferences(starId: number, referenceIds?: string[]) {
  return await prisma.reference.findMany({
    where: {
      starId,
      referenceId: referenceIds
        ? {
            in: referenceIds,
          }
        : undefined,
    },
  });
}

export function createReferences(
  refs: Array<{ referenceId: string; starId: number; author: string; bibcode: string }>
) {
  return prisma.reference.createMany({
    data: refs,
  });
}
