import wretch from "wretch";
import { retry } from "wretch/middlewares/retry";
import FormUrlAddon from "wretch/addons/formUrl";

const w = wretch()
  .addon(FormUrlAddon)
  .middlewares([
    retry({
      maxAttempts: 3,
      retryOnNetworkError: true,
    }),
  ]);

export async function fetchObjectIds(input: string) {
  const { data } = await w
    .url("https://simbad.harvard.edu/simbad/sim-tap/sync")
    .formUrl({
      REQUEST: "doQuery",
      PHASE: "RUN",
      FORMAT: "JSON",
      LANG: "ADQL",
      query: `SELECT oidref, id, main_id FROM ident JOIN basic ON oidref = oid WHERE oidref IN (SELECT oidref FROM ident WHERE id = \'${input}\')`,
    })
    .post()
    .json<{ data: Array<[oid: number, id: string, mainId: string]> }>();

  const oid = data?.[0]?.[0];
  if (!oid) {
    return null;
  }
  const tyc = data.find(([_, id]) => id.toLocaleLowerCase().startsWith("tyc"))?.[1].replaceAll(" ", "");
  const hip = data.find(([_, id]) => id.toLocaleLowerCase().startsWith("hip"))?.[1].replaceAll(" ", "");
  const hd = data.find(([_, id]) => id.toLocaleLowerCase().startsWith("hd"))?.[1].replaceAll(" ", "");
  const mainId = hd ?? data[0][2];

  return {
    oid,
    tyc,
    hip,
    mainId,
  };
}

/**
 *
 * @param input
 * @returns SIMBAD oid
 */
export async function fetchObjectId(input: string) {
  const { data } = await w
    .url("https://simbad.harvard.edu/simbad/sim-tap/sync")
    .formUrl({
      REQUEST: "doQuery",
      PHASE: "RUN",
      FORMAT: "JSON",
      LANG: "ADQL",
      query: `SELECT oidref FROM ident WHERE id = \'${input}\'`,
    })
    .post()
    .json<any>();

  return data?.[0]?.[0] as number | undefined;
}
