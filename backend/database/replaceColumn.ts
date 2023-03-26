import fs from "fs";
import { parse, unparse } from "papaparse";
import PQueue from "p-queue";

interface CsvData {
  [key: string]: string;
}

export async function replaceColumnValue(
  filePath: string,
  outputFilePath: string,
  columnName: string,
  callback: (value: string) => Promise<string>,
  cache: Map<string, string> = new Map<string, string>(),
  concurrency: number = 200
): Promise<void> {
  const csvData = fs.readFileSync(filePath, "utf8");
  const parsedCsvData = parse<CsvData>(csvData, { header: true });

  const queue = new PQueue({ concurrency });

  if (parsedCsvData.errors.length) {
    console.warn(`Found errors during parsing of ${filePath}`);
    console.warn(parsedCsvData.errors);
  }

  // First create set of unique values, then call callback (this way we do not call callback on same value twice)
  const colValuesSet = new Set(parsedCsvData.data.map((data) => data[columnName]));
  const mappedValuesPromise = [...colValuesSet].map((value) =>
    queue.add(async () => {
      const cachedResult = cache.get(value);
      if (cachedResult) {
        return;
      }
      const newValue = await callback(value);
      cache.set(value, newValue);
    })
  );

  await Promise.all(mappedValuesPromise);
  parsedCsvData.data.forEach((data) => {
    data[columnName] = cache.get(data[columnName])!;
  });

  const res = unparse(parsedCsvData.data);
  await fs.promises.writeFile(outputFilePath, res);
}
