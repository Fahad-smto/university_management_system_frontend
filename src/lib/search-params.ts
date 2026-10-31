export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// Next gives search params as a Promise that can hold arrays. We want plain strings.
export async function readParams(searchParams: SearchParams): Promise<Record<string, string | undefined>> {
  const raw = await searchParams;
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out;
}

export function pageOf(params: Record<string, string | undefined>): number {
  const page = Number(params.page);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
