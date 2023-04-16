import { readFileSync, writeFileSync } from "node:fs";
import papaparse from "papaparse";

function groupBy(array, keys) {
  return array.reduce(function (acc, obj) {
    let property = keys.map((key) => obj[key]).join("|");
    if (!acc[property]) {
      acc[property] = [];
    }
    acc[property].push(obj);
    return acc;
  }, {});
}

// const headers = "referenceId,starId,author,bibcode,referenceStarIds";
const columnCount = 6;

const csv = readFileSync("./input/reference.csv", { encoding: "utf8" });
const { data } = papaparse.parse(csv, { delimiter: "," });

const output = [];
data.forEach((row, i) => {
  if (row.length !== columnCount) {
    console.warn(`Skipping line ${i + 1}. Found only ${row.length} columns. (Needs ${columnCount})`);
    return;
  }

  output.push({
    referenceId: Number(row[0]).toString(),
    starId: `HD${Number(row[1]).toString()}`,
    author: row[2],
    bibcode: row[3],
    referenceStarIds: row[4],
  });
});

const nonUniqueRows = Object.values(
  groupBy(
    output.map((x, i) => ({ ...x, row: i + 1 })),
    ["referenceId", "starId"]
  )
)
  .filter((group) => group.length > 1)
  .map((group) => group.map((r) => r.row).join(", "));

if (nonUniqueRows.length) {
  console.warn("Found some rows that do not have unique hd number and reference combination");
  console.log(nonUniqueRows.join("\n"));
}

// Skip all references with id 0. Those are references to the tycho catalog, which is going to be loaded on demand
const outputWithoutTycho = output.filter((ref) => +ref.referenceId !== 0);

const cvsString = papaparse.unparse(outputWithoutTycho, {
  delimiter: ",",
  header: true,
});

writeFileSync("./script-output/reference.csv", cvsString, { encoding: "utf8" });
console.log("Results saved in file ./script-output/reference.csv");
