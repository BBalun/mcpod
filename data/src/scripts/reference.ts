import { readCSV } from "https://deno.land/x/csv@v0.8.0/mod.ts";

const outputSeparator = ",";

const headers = "referenceId,starId,author,bibcode,referenceStarIds";
const columnCount = 6;

const res = [headers];

const file = await Deno.open("../reference.csv");

let i = 0;
for await (const row of readCSV(file)) {
  const parts = [] as string[];
  for await (const cell of row) {
    parts.push(cell);
  }

  if (parts.length < columnCount) {
    console.warn(`Skipping line ${i + 1}. Found only ${parts.length} columns. (Needs at least ${columnCount})`);
    console.warn(parts);
    continue;
  }
  parts.splice(5, 1); // remove 6th column (description)
  parts[0] = Number(parts[0]).toString();
  parts[1] = "HD" + Number(parts[1]).toString();
  parts[2] = `"${parts[2]}"`;
  parts[3] = `"${parts[3]}"`;
  parts[4] = `"${parts[4]}"`;

  res.push(parts.join(outputSeparator));
  i++;
}

file.close();

Deno.writeTextFileSync("./output/reference.csv", res.join("\n"));
console.log("Results saved in file reference.csv");
