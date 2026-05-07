import {
  computeBestLines,
  type AggregatedGame,
  type BookOutcome,
  type Market,
  type MarketBlock,
} from "@loa/shared";
import type { RawGame } from "./odds-client.js";

/**
 * Convert OddsAPI's nested payload into a flat per game structure with best
 * lines and EV uplift baked in. The frontend only consumes this shape.
 */
export function aggregate(games: RawGame[]): AggregatedGame[] {
  const fetchedAt = new Date().toISOString();
  return games.map((g) => {
    const markets: MarketBlock[] = (["spreads", "totals", "h2h"] as const)
      .map((m) => buildMarket(g, m))
      .filter((b): b is MarketBlock => b !== null);
    return {
      gameId: g.id,
      homeTeam: g.home_team,
      awayTeam: g.away_team,
      commenceTime: g.commence_time,
      markets,
      fetchedAt,
    };
  });
}

function buildMarket(game: RawGame, market: Market): MarketBlock | null {
  const outcomes: BookOutcome[] = [];
  for (const bk of game.bookmakers) {
    for (const m of bk.markets) {
      if (m.key !== market) continue;
      for (const o of m.outcomes) {
        outcomes.push({
          book: bk.key,
          side: o.name,
          price: o.price,
          point: o.point ?? null,
          lastUpdate: bk.last_update ?? m.last_update ?? "",
        });
      }
    }
  }
  if (outcomes.length === 0) return null;

  const sides = uniqueSides(outcomes);
  if (sides.length < 2) {
    return { market, outcomes, bestLines: [] };
  }
  const bestLines = computeBestLines(outcomes, { sideA: sides[0]!, sideB: sides[1]! });
  return { market, outcomes, bestLines };
}

function uniqueSides(outcomes: BookOutcome[]): string[] {
  const set = new Set<string>();
  for (const o of outcomes) set.add(o.side);
  return [...set];
}
