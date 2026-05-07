import { describe, expect, it } from "vitest";
import {
  americanToDecimal,
  americanToImplied,
  computeBestLines,
  decimalToAmerican,
  evPercent,
  impliedToAmerican,
  noVigFairProbabilityPair,
} from "../src/index.js";

describe("americanToImplied", () => {
  it("minus 110 implies 52.38%", () => {
    expect(americanToImplied(-110)).toBeCloseTo(0.5238, 3);
  });
  it("plus 100 implies 50%", () => {
    expect(americanToImplied(100)).toBeCloseTo(0.5, 3);
  });
});

describe("noVigFairProbabilityPair", () => {
  it("symmetric -110 / -110 implies 50% per side", () => {
    expect(noVigFairProbabilityPair(-110, -110)).toBeCloseTo(0.5, 6);
  });

  it("favorite minus 200 against plus 170 yields a fair prob above 0.625", () => {
    const p = noVigFairProbabilityPair(-200, 170);
    expect(p).toBeGreaterThan(0.625);
    expect(p).toBeLessThan(0.66);
  });
});

describe("evPercent", () => {
  it("zero EV when offered equals fair", () => {
    const fair = noVigFairProbabilityPair(-110, -110);
    const evA = evPercent(-110, fair);
    expect(Math.abs(evA)).toBeLessThan(0.001);
  });

  it("positive EV when the offered price beats fair", () => {
    const ev = evPercent(110, 0.55);
    expect(ev).toBeGreaterThan(0);
  });
});

describe("americanToDecimal round trip", () => {
  it("reverses cleanly for symmetric points", () => {
    expect(decimalToAmerican(americanToDecimal(-110))).toBe(-110);
    expect(decimalToAmerican(americanToDecimal(150))).toBe(150);
  });
});

describe("impliedToAmerican", () => {
  it("0.5 maps to plus 100", () => {
    expect(impliedToAmerican(0.5)).toBe(100);
  });
  it("invertible enough for EV math", () => {
    const fair = noVigFairProbabilityPair(-130, 110);
    const american = impliedToAmerican(fair);
    expect(americanToImplied(american)).toBeCloseTo(fair, 2);
  });
});

describe("computeBestLines", () => {
  it("picks the highest payout per side and computes EV with no vig pair", () => {
    const lines = computeBestLines(
      [
        {
          book: "draftkings",
          side: "Bears",
          price: -115,
          point: -3,
          lastUpdate: "2026-09-08T20:00:00Z",
        },
        {
          book: "fanduel",
          side: "Bears",
          price: -108,
          point: -3,
          lastUpdate: "2026-09-08T20:01:00Z",
        },
        {
          book: "betmgm",
          side: "Packers",
          price: -110,
          point: 3,
          lastUpdate: "2026-09-08T20:00:00Z",
        },
      ],
      { sideA: "Bears", sideB: "Packers" },
    );
    expect(lines.length).toBe(2);
    expect(lines[0]?.bestBook).toBe("fanduel");
    expect(lines[0]?.bestPrice).toBe(-108);
  });
});
