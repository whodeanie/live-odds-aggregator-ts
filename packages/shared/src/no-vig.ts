/**
 * No vig fair pricing utilities.
 *
 * American odds convert to implied probability:
 *   if odds > 0:  1 / (odds/100 + 1)
 *   if odds < 0:  1 / (100/abs(odds) + 1)
 * Two sided markets carry vig: implieds sum above 1.0. Normalising by the sum
 * yields a no vig pair, the canonical "fair" probability used to compute EV.
 */

export function americanToImplied(american: number): number {
  if (american === 0) throw new Error("american odds cannot be zero");
  if (american > 0) return 1 / (american / 100 + 1);
  return 1 / (100 / Math.abs(american) + 1);
}

export function americanToDecimal(american: number): number {
  if (american > 0) return 1 + american / 100;
  return 1 + 100 / Math.abs(american);
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

/**
 * Strip vig from a pair of American odds. Returns the no vig fair probability
 * for side A (the first odds you pass).
 */
export function noVigFairProbabilityPair(americanA: number, americanB: number): number {
  const a = americanToImplied(americanA);
  const b = americanToImplied(americanB);
  const total = a + b;
  if (total <= 0) throw new Error("invalid odds: implied probabilities sum to zero");
  return a / total;
}

/**
 * EV uplift expressed as a fraction. Positive when the offered price beats
 * the fair price. EV is calculated as fairProb * decimalOdds minus 1, where
 * decimalOdds is derived from the offered American line.
 */
export function evPercent(offered: number, fairProb: number): number {
  const decimal = americanToDecimal(offered);
  return fairProb * decimal - 1;
}

/**
 * Fair price in American format from a probability. Inverse of americanToImplied.
 */
export function impliedToAmerican(prob: number): number {
  if (prob <= 0 || prob >= 1) throw new Error("prob must be between 0 and 1");
  if (prob >= 0.5) {
    return Math.round((-prob / (1 - prob)) * 100);
  }
  return Math.round(((1 - prob) / prob) * 100);
}
