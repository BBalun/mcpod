import { TRPCError } from "@trpc/server";
import fetch from "isomorphic-fetch";

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
      query: `SELECT * FROM ident WHERE oidref IN  (SELECT ident.oidref FROM basic JOIN ident ON oidref = oid WHERE id = \'${input}\')`,
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
