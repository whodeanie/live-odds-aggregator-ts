import { z } from "zod";
import type { Region } from "@loa/shared";

const OutcomeSchema = z.object({
  name: z.string(),
  price: z.number(),
  point: z.number().optional(),
});

const MarketSchema = z.object({
  key: z.string(),
  last_update: z.string().optional(),
  outcomes: z.array(OutcomeSchema),
});

const BookmakerSchema = z.object({
  key: z.string(),
  title: z.string(),
  last_update: z.string().optional(),
  markets: z.array(MarketSchema),
});

const GameSchema = z.object({
  id: z.string(),
  sport_key: z.string(),
  commence_time: z.string(),
  home_team: z.string(),
  away_team: z.string(),
  bookmakers: z.array(BookmakerSchema),
});

export type RawGame = z.infer<typeof GameSchema>;

export interface FetchOptions {
  apiKey: string;
  sport: string;
  region: Region;
}

export async function fetchOdds(opts: FetchOptions): Promise<RawGame[]> {
  const url = new URL(`https://api.the-odds-api.com/v4/sports/${opts.sport}/odds`);
  url.searchParams.set("apiKey", opts.apiKey);
  url.searchParams.set("regions", opts.region);
  url.searchParams.set("markets", "spreads,totals,h2h");
  url.searchParams.set("oddsFormat", "american");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`OddsAPI request failed ${res.status} ${res.statusText}`);
  const json: unknown = await res.json();
  return z.array(GameSchema).parse(json);
}
