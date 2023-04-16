import papaparse from "papaparse";
import { getDataForExport } from "../data/catalogRepository";

type ExportOptionsProps = {
  starIds?: number[];
  filters?: string[];
  startDate?: number;
  endDate?: number;
};

export async function exportToCsv({ starIds, filters, startDate, endDate }: ExportOptionsProps) {
  const res = await getDataForExport(starIds, filters, startDate, endDate);

  return papaparse.unparse(res, {
    delimiter: ",",
    header: true,
    columns: ["star", "referenceId", "julianDate", "filter", "magnitude", "magErr"],
  });
}
