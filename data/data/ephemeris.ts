const text = await Deno.readTextFile("../elementy.csv");
const lines = text.split("\n");
const res = ["starId,epoch,period"];
const separator = ",";

for (const [i, line] of lines.entries()) {
  const parts = line.split(" ");
  if (parts.length !== 3) {
    console.warn(`found ${parts.length} input on line ${i + 1}`);
    console.warn("Skipping current line");
    continue;
  }
  parts[0] = `HD${parts[0]}`;
  res.push(parts.join(separator));
}

Deno.writeTextFileSync("./output/ephemeris.csv", res.join("\n"));
console.log("Results saved in file ephemeris.csv");
