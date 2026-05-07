/**
 * Pick the best price across books for each side of a market and compute the
 * EV uplift over a no vig fair price.
 */
import { evPercent, impliedToAmerican, noVigFairProbabilityPair } from "./no-vig.js";
import type { BestLine, BookOutcome } from "./types.js";

export interface PairChoice {
  sideA: string;
  sideB: string;
}

/**
 * Computes a best price summary for the two sides of a market. Returns an
 * array of two BestLine entries: one per side. Outcomes can come from many
 * books; the function picks the best (highest decimal payout) per side and
 * computes EV using no vig fair pricing derived from the best price pair.
 */
export function computeBestLines(outcomes: BookOutcome[], pair: PairChoice): BestLine[] {
  const sideA = bestForSide(outcomes, pair.sideA);
  const sideB = bestForSide(outcomes, pair.sideB);
  if (!sideA || !sideB) return [];

  const fairA = noVigFairProbabilityPair(sideA.price, sideB.price);
  const fairB = 1 - fairA;

  return [
    {
      side: sideA.side,
      bestPrice: sideA.price,
      bestBook: sideA.book,
      fairPrice: impliedToAmerican(fairA),
      evPercent: evPercent(sideA.price, fairA),
      point: sideA.point,
    },
    {
      side: sideB.side,
      bestPrice: sideB.price,
      bestBook: sideB.book,
      fairPrice: impliedToAmerican(fairB),
      evPercent: evPercent(sideB.price, fairB),
      point: sideB.point,
    },
  ];
}

function bestForSide(outcomes: BookOutcome[], side: string): BookOutcome | undefined {
  let best: BookOutcome | undefined;
  for (const o of outcomes) {
    if (o.side !== side) continue;
    if (!best || decimalPayout(o.price) > decimalPayout(best.price)) best = o;
  }
  return best;
}

function decimalPayout(american: number): number {
  if (american > 0) return american / 100;
  return 100 / Math.abs(american);
}
