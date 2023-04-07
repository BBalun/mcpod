import { readFileSync, writeFileSync } from "node:fs";

const text = readFileSync("./input/pozorovani.csv", { encoding: "utf8" });
const lines = text.split("\n");

const separator = ",";
const inputSeparator = " ";

// 5th column (number of entries in catalog file) is removed, therefore only 8 columns in header variable
const headers = "starId,lambdaEff,filter,referenceId,magAverage,magError,stdError,amplitudeEff";
const columnCount = 9;

const res = [headers];
const uniqueIds = new Map();

for (const [lineIndex, line] of lines.entries()) {
  const parts = line
    .trim()
    .split(inputSeparator)
    .map((part) => part.trim());

  if (parts.length !== columnCount) {
    console.warn(`Skipping line ${lineIndex + 1}. Found only ${parts.length} columns. (Needs at least ${columnCount})`);
    continue;
  }

  if (Number(parts[3]) === 0) {
    // Skip all references with id 0. Those are references to the tycho catalog, which is going to be loaded on demand
    continue;
  }

  parts.splice(4, 1); // remove 5th column (count)
  parts[0] = `HD${parseInt(parts[0])}`;

  const lineId = parts[0] + parts[2] + parts[3];
  if (uniqueIds.has(lineId)) {
    uniqueIds.get(lineId).push(lineIndex + 1);
  } else {
    uniqueIds.set(lineId, [lineIndex + 1]);
  }

  res.push(parts.join(separator));
}

const nonUniqueValues = [...uniqueIds.values()].filter((x) => x.length > 1);
if (nonUniqueValues.length) {
  console.warn("Found some rows that do not have unique hd number, reference and filter combination");
  nonUniqueValues.forEach((x) => console.warn(x.join(", ")));
}

writeFileSync("./script-output/observation.csv", res.join("\n"), { encoding: "utf8" });
console.log("Results saved in file ./script-output/observation.csv");
