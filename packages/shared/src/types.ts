/**
 * Shared types. Used by the Hono backend and the Next.js frontend so both ends
 * stay in lockstep.
 */

export type Region = "us" | "uk" | "eu" | "au";

export const SUPPORTED_BOOKS = [
  "draftkings",
  "fanduel",
  "betmgm",
  "caesars",
  "pointsbetus",
] as const;
export type Book = (typeof SUPPORTED_BOOKS)[number];

export const SUPPORTED_MARKETS = ["spreads", "totals", "h2h"] as const;
export type Market = (typeof SUPPORTED_MARKETS)[number];

export interface BookOutcome {
  book: string;
  side: string;
  price: number;
  point: number | null;
  lastUpdate: string;
}

export interface BestLine {
  side: string;
  bestPrice: number;
  bestBook: string;
  fairPrice: number;
  evPercent: number;
  point: number | null;
}

export interface MarketBlock {
  market: Market;
  bestLines: BestLine[];
  outcomes: BookOutcome[];
}

export interface AggregatedGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  markets: MarketBlock[];
  fetchedAt: string;
}

export interface AggregatedResponse {
  fetchedAt: string;
  cached: boolean;
  ttlSeconds: number;
  games: AggregatedGame[];
}
