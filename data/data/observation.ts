const text = await Deno.readTextFile("../pozorovani.csv");
const lines = text.split("\n");

const separator = ",";
const inputSeparator = " ";

const headers = "starId,lambdaEff,filter,referenceId,magAverage,magError,stdError,amplitudeEff";
const columnCount = 9;

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

  parts.splice(4, 1); // remove 5th column (count)
  parts[0] = `HD${parts[0]}`;

  res.push(parts.join(separator));
}

Deno.writeTextFileSync("./output/observation.csv", res.join("\n"));
console.log("Results saved in file observation.csv");
