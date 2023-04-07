import { readFileSync, writeFileSync } from "node:fs";

const text = readFileSync("./input/katalog.csv", { encoding: "utf8" });

const lines = text.split("\n");

const separator = ",";
const inputSeparator = "\t";

const headers = "starId,julianDate,magnitude,magError,filter,referenceId";
const columnCount = headers.split(separator).length;

const res = [headers];

for (const [i, line] of lines.entries()) {
  const parts = line
    .trim()
    .split(inputSeparator)
    .map((part) => part.trim());

  if (parts.length !== columnCount) {
    console.warn(`Skipping line ${i + 1}. Found only ${parts.length} columns. (Needs ${columnCount})`);
    continue;
  }

  parts[0] = "HD" + Number(parts[0]).toString();
  const referenceId = Number(parts[parts.length - 1]).toString();
  if (referenceId === "0") {
    // Skip all references with id 0. Those are references to the tycho catalog, which is going to be loaded on demand
    continue;
  }
  parts[parts.length - 1] = referenceId;

  res.push(parts.join(separator));
}

writeFileSync("./script-output/catalog.csv", res.join("\n"));
console.log("Results saved in file ./script-output/catalog.csv");
