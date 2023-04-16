import * as CatalogRepository from "../data/catalogRepository";

export async function getData(
  starId: number,
  filters: string[],
  startDate: number | undefined,
  endDate: number | undefined,
  referenceIds: string[] | undefined
) {
  const data = await CatalogRepository.getData(starId, filters, startDate, endDate, referenceIds);

  return groupByFilterCode(data);
}

export async function getPhasedData(
  starId: number,
  filters: string[],
  startDate: number | undefined,
  endDate: number | undefined,
  referenceIds: string[] | undefined,
  period: number,
  epoch: number
) {
  const data = await CatalogRepository.getData(starId, filters, startDate, endDate, referenceIds);

  // replaces julianDate with phase
  const phasedData = data.map(({ julianDate, ...rest }) => ({
    ...rest,
    phase: calculatePhase(julianDate, period, epoch),
  }));

  return groupByFilterCode(phasedData);
}

function groupByFilterCode<T extends { filter: string }>(data: T[], filters: string[] = []) {
  const res = filters.reduce((map, filter) => {
    map[filter] = [];
    return map;
  }, {} as Record<string, typeof data>);

  return data.reduce((map, catalog) => {
    const data = map[catalog.filter];
    if (data) {
      data.push(catalog);
    } else {
      map[catalog.filter] = [catalog];
    }
    return map;
  }, res);
}

/**
 * Calculate Phase
 * @param date Julian date for which a phase should be calculated
 * @param period Period in days
 * @param epoch Julian date used as a reference point/ offset for phase calculation
 */
function calculatePhase(date: number, period: number, epoch: number) {
  // $phase = ($jd - $epoch) / $period;
  // $phase -= floor($phase);
  // return number_format(round($phase, 3), 3, '.', '');
  let phase = (date - epoch) / period;
  phase -= Math.floor(phase);
  while (phase < 0) {
    phase += period;
  }
  return phase;
}
