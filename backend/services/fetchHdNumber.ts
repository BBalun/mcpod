import fetch from "isomorphic-fetch";

export async function fetchHdNumber(input: string) {
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
  const data = await res.json();

  if (res.status !== 200) {
    return {
      error: {
        msg: "Fetching of error number failed",
        status: res.status,
        data,
      },
      data: null,
    };
  }

  const starData = (data as any).data as Array<[string, number]>;

  const simbadId = starData.map(([_, simbadId]) => simbadId).sort((a, b) => a - b)[0];

  const hdNumberFields = starData.filter(([id, sId]) => sId === simbadId && id.startsWith("HD "));

  if (!hdNumberFields.length) {
    return {
      error: {
        msg: `Failed to find hd number for star ${input}`,
      },
      data: null,
    };
  }

  const [hdNumberString, _] = hdNumberFields.sort((a, b) => a.length - b.length)[0];

  const hdNumber = parseInt(hdNumberString.replace("HD ", "").replaceAll(" ", ""));
  if (isNaN(hdNumber)) {
    return {
      error: {
        msg: `Failed to parse hd number for star ${input}`,
      },
      data: null,
    };
  }
  return {
    error: null,
    data: hdNumber,
  };
}
