import type { AggregatedResponse } from "@loa/shared";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8787";

export async function fetchAggregated(sport: string, region: string): Promise<AggregatedResponse> {
  const url = new URL(`${BASE}/v1/odds`);
  url.searchParams.set("sport", sport);
  url.searchParams.set("region", region);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`server error ${res.status}`);
  return (await res.json()) as AggregatedResponse;
}
