// Use of isomorphic-fetch is required here, because this endpoint
// returns malformed HTTP headers. For node to parse them, we need to
// include --insecure-http-parser flag, which is only applied when
// using node http module, which is used by isomorphic-fetch.
// Standard fetch API doesn't work.
import fetch from "isomorphic-fetch";
import { InternalServerError } from "../exceptions/InternalServerError";

type PhotometricData = { julianDate: number; magnitude: number; magErr: number };

export async function fetchExternalPhotometryData(hip: string | null, tyc: string | null) {
  const res = {
    Hp: [] as PhotometricData[],
    Bt: [] as PhotometricData[],
    Vt: [] as PhotometricData[],
  };

  if (!hip && !tyc) {
    return res;
  }

  const url = `https://cdsarc.cds.unistra.fr/viz-bin/nph-Plot/Vgraph/txt?I%2f239%2f.%2f${hip ?? "0"}&${
    tyc ?? "0"
  }&P=0&-Y&mag&-y&-&-&-`;

  let data;
  try {
    data = await fetch(url).then((res) => res.text());
  } catch (e) {
    console.error(e);
    console.error("Failed to fetch external photometry data from vizier");
    // TODO: should this thrown an exception or just return no data
    throw new InternalServerError({
      message: "Failed to fetch external photometry data from vizier",
    });
  }

  const lines = data.split("\n").slice(2); // remove first 2 line

  let sections;
  if (hip && !tyc) {
    sections = [res.Hp];
  } else if (tyc && !hip) {
    sections = [res.Vt, res.Bt];
  } else {
    sections = [res.Vt, res.Bt, res.Hp];
  }

  let currentSectionIndex = 0;
  for (let line of lines.filter((x) => x.trim().length)) {
    if (line.startsWith("#")) {
      currentSectionIndex++;
      if (currentSectionIndex >= sections.length) {
        console.error("Found extra section while parsing external photometric data");
        throw new Error("Found extra section while parsing external photometric data");
      }
      continue;
    }

    const parts = line
      .split(" ")
      .filter((part) => part.trim().length)
      .map(Number);

    if (parts.length !== 3) {
      console.warn("Found line with not 3 part while parsing external photometric data");
      continue;
    }

    const [julianDate, magnitude, magErr] = parts;
    sections[currentSectionIndex].push({ julianDate: Number((julianDate + 40_000).toFixed(5)), magnitude, magErr });
  }

  const hipparcosMeanMagnitude = res.Hp.reduce((sum, data) => sum + data.magnitude, 0) / res.Hp.length;
  return {
    Hp: res.Hp,
    Bt: filterOutliers(res.Bt, hipparcosMeanMagnitude - 2, hipparcosMeanMagnitude + 2),
    Vt: filterOutliers(res.Vt, hipparcosMeanMagnitude - 2, hipparcosMeanMagnitude + 2),
  };
}

function filterOutliers(data: PhotometricData[], min: number, max: number) {
  return data.filter((data) => data.magnitude >= min && data.magnitude <= max);
}
