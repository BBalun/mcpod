import { findUniqueReferenceIds } from "../data/catalog";
import { findReferences } from "../data/reference";

export async function getReferences(starId: number, filters?: string[]) {
  let referenceIds;
  if (filters && filters.length) {
    referenceIds = await findUniqueReferenceIds(starId, filters);
  }

  return await findReferences(starId, referenceIds);
}
