import { TRPCError } from "@trpc/server";
// import fetch from "isomorphic-fetch";
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

/// Fetch star IDs - HD, HIP, TYC numbers
export async function fetchStarIds(input: string) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      REQUEST: "doQuery",
      PHASE: "RUN",
      FORMAT: "JSON",
      LANG: "ADQL",
      // query: `SELECT * FROM ident WHERE oidref IN  (SELECT ident.oidref FROM basic JOIN ident ON oidref = oid WHERE id = \'${input}\')`,
      query: `SELECT oidref FROM ident WHERE id = \'${input}\'`,
    }),
  };

  const res = await fetch("http://simbad.u-strasbg.fr/simbad/sim-tap/sync", options);

  if (res.status !== 200) {
    const body = await res.text();
    console.error(`Failed to fetch data from SIMBAD. Status code: ${res.status}`);
    console.error(`Response body: ${body}`);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch data from SIMBAD. Status code: ${res.status}`,
      cause: body,
    });
  }
  const data = await res.json();
  const starIdsData = (data as any).data as Array<[string, number]>;

  // Query may return multiple stars (star identifiers), sort them and choose the smaller one
  const simbadId = starIdsData
    .map(([_, simbadId]) => simbadId)
    .sort((a, b) => a - b)
    .at(0)!;

  const starIds = starIdsData
    .filter(([_id, sId]) => sId === simbadId) // Make sure that only IDs of one star are present
    .map(([id, _sId]) => id)
    // .map((id) => id.replace(/\s+/g, " ")); // replace all sequences of white space characters with only one space
    .filter((id) => id.startsWith("HD") || id.startsWith("HIP") || id.startsWith("TYC")) // for now, use only HD, HIP and TYC identifiers
    .map((id) => id.replaceAll(" ", ""));

  return starIds;

  // if (!starIds.length) {
  //   return {
  //     error: {
  //       msg: `Failed to find any start identifiers for star ${input}`,
  //     },
  //     data: null,
  //   };
  // }

  // // Some IDs should contain spaces (NAME id), but some should not (HD, TYC, HIP)
  // // Just to make sure include both variants of IDs in a search
  // // Also include users input, just in case someone entered custom/non-standard ID into a database
  // const starIdVariants = [input, ...starIds, ...starIds.map((id) => id.replaceAll(" ", ""))];

  // return {
  //   error: null,
  //   data: starIdVariants,
  // };
}

export async function fetchObjectIds(input: string) {
  // const options = {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   body: new URLSearchParams({
  //     REQUEST: "doQuery",
  //     PHASE: "RUN",
  //     FORMAT: "JSON",
  //     LANG: "ADQL",
  //     // query: `SELECT * FROM ident WHERE oidref IN  (SELECT ident.oidref FROM basic JOIN ident ON oidref = oid WHERE id = \'${input}\')`,
  //     query: `SELECT oidref FROM ident WHERE id = \'${input}\'`,
  //   }),
  // };

  // const res = await fetch("https://simbad.harvard.edu/simbad/sim-tap/sync", options);

  // if (res.status !== 200) {
  //   const body = await res.text();
  //   console.error(`Response body: ${body}`);
  //   throw new Error(`Failed to fetch data from SIMBAD. Status code: ${res.status}`);
  // }
  const { data } = await w
    .url("https://simbad.harvard.edu/simbad/sim-tap/sync")
    .formUrl({
      REQUEST: "doQuery",
      PHASE: "RUN",
      FORMAT: "JSON",
      LANG: "ADQL",
      // query: `SELECT oidref FROM ident WHERE id = \'${input}\'`,
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
  const mainId = data[0][2];
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
