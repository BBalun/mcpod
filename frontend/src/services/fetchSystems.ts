import { System } from "../types/systems";

export async function fetchSystems() {
  const res = await fetch("/systems.json");
  if (res.status !== 200) {
    throw new Error("Failed to fetch systems");
  }
  const data = await res.json();
  return data as System[];
}
