const text = await Deno.readTextFile("../katalog.csv");
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

  if (parts.length < columnCount) {
    console.warn(`Skipping line ${i + 1}. Found only ${parts.length} columns. (Needs at least ${columnCount})`);
    continue;
  }

  parts[0] = "HD" + Number(parts[0]).toString();
  parts[parts.length - 1] = Number(parts[parts.length - 1]).toString();

  res.push(parts.join(separator));
}

Deno.writeTextFileSync("./output/catalog.csv", res.join("\n"));
console.log("Results saved in file catalog.csv");
