import { prisma } from "../database/prisma";

export async function findObservations(starId: number, referenceId: string) {
  return await prisma.observation.findMany({
    where: {
      starId,
      referenceId,
    },
  });
}

export function createObservations(
  observations: Array<{
    starId: number;
    referenceId: string;
    filter: string;
    count: number;
  }>
) {
  return prisma.observation.createMany({
    data: observations,
  });
}
