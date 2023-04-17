import { prisma } from "../database/prisma";
import { findObservations } from "./observationRepository";

export async function findReferences(starId: number, referenceIds?: string[]) {
  const references = await prisma.reference.findMany({
    where: {
      starId,
      referenceId: referenceIds
        ? {
            in: referenceIds,
          }
        : undefined,
    },
  });

  // include observations
  return await Promise.all(
    references.map(async (ref) => {
      const observations = await findObservations(ref.starId, ref.referenceId);
      return { ...ref, observations };
    })
  );
}

export function createReferences(
  refs: Array<{ referenceId: string; starId: number; author: string; bibcode: string }>
) {
  return prisma.reference.createMany({
    data: refs,
  });
}
