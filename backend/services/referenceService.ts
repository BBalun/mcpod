import { findUniqueReferenceIds } from "../data/catalogRepository";
import { findReferences } from "../data/referenceRepository";

export async function getReferences(starId: number, filters?: string[]) {
  let referenceIds;
  if (filters && filters.length) {
    referenceIds = await findUniqueReferenceIds(starId, filters);
  }

  return await findReferences(starId, referenceIds);
}
