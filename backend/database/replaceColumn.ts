import fs from "fs";
import { parse, unparse } from "papaparse";
import PQueue from "p-queue";

interface CsvData {
  [key: string]: string;
}

const cache = new Map<string, Promise<string>>();

export async function replaceColumnValue(
  filePath: string,
  outputFilePath: string,
  columnName: string,
  callback: (value: string) => Promise<string>
): Promise<void> {
  const csvData = fs.readFileSync(filePath, "utf8");
  const parsedCsvData = parse<CsvData>(csvData, { header: true });

  const queue = new PQueue({ concurrency: 200 });

  if (parsedCsvData.errors.length) {
    console.warn(`Found errors during parsing of ${filePath}`);
    console.warn(parsedCsvData.errors);
  }

  const length = parsedCsvData.data.length;
  let progress = 0;
  const interval = setInterval(() => {
    console.log(`Progress: ${++progress}/${length}`);
  }, 500);

  const resultsPromise = parsedCsvData.data.map((data) =>
    queue.add(async () => {
      progress += 1;
      const originalValue = data[columnName];

      let newValue;
      const cachedValue = cache.get(originalValue);
      if (!cachedValue) {
        const temp = callback(originalValue);
        cache.set(originalValue, temp);
        newValue = temp;
      } else {
        newValue = cachedValue;
      }

      data[columnName] = await newValue;
      return data;
    })
  );

  const results = await Promise.all(resultsPromise);
  clearInterval(interval);

  const res = unparse(results);
  await fs.promises.writeFile(outputFilePath, res);
}
