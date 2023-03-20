import { System } from "../types/systems";

export function findFilterUsingCode(code: string, systems: System[]) {
  return systems
    .flatMap((system) => system.filters)
    .find((filter) => filter.code === code);
}
