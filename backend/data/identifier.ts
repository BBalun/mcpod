import { prisma } from "../database/prisma";

export async function findIdentifierByStarId(starId: number) {
  return await prisma.identifier.findUnique({
    where: {
      starId,
    },
  });
}

export function setIdentifierToBeFetched(starId: number) {
  return prisma.identifier.update({
    where: {
      starId,
    },
    data: {
      isFetched: true,
    },
  });
}

export function upsertIdentifiers(identifiers: {
  oid: number;
  tyc: string | undefined;
  hip: string | undefined;
  mainId: string;
}) {
  return prisma.identifier.upsert({
    where: {
      starId: identifiers.oid,
    },
    update: {
      mainId: identifiers.mainId,
      hip: identifiers.hip,
      tyc: identifiers.tyc,
    },
    create: {
      starId: identifiers.oid,
      mainId: identifiers.mainId,
      hip: identifiers.hip,
      tyc: identifiers.tyc,
      isFetched: false,
    },
  });
}

export function getCount() {
  return prisma.identifier.count();
}
