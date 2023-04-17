import { InternalServerError } from "../exceptions/InternalServerError";

export async function getExternalEphemerids(starId: string) {
  const url = new URL("https://www.aavso.org/vsx/index.php?view=api.object&format=json");
  url.searchParams.append("ident", starId);

  const res = await fetch(url);
  if (res.status !== 200) {
    console.error(`Failed to fetch data from aavso. Return status: ${res.status}`);
    console.error(`Body: ${await res.text()}`);
    throw new InternalServerError({
      message: `Failed to fetch data from aavso. Return status: ${res.status}`,
    });
  }

  const body = await res.json();

  const periodStr = (body?.VSXObject?.Period ?? null) as string | null;
  const epochStr = (body?.VSXObject?.Epoch ?? null) as string | null;

  const period = periodStr ? Number(periodStr) : null;
  const epoch = epochStr ? Number(epochStr) : null;

  return {
    period,
    epoch,
  };
}
