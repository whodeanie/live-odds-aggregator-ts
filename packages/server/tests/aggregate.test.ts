import { describe, expect, it } from "vitest";
import { aggregate } from "../src/aggregate.js";
import type { RawGame } from "../src/odds-client.js";

describe("aggregate", () => {
  it("flattens books into market blocks with best lines per side", () => {
    const games: RawGame[] = [
      {
        id: "g1",
        sport_key: "americanfootball_nfl",
        commence_time: "2026-09-08T20:00:00Z",
        home_team: "Bears",
        away_team: "Packers",
        bookmakers: [
          {
            key: "draftkings",
            title: "DraftKings",
            markets: [
              {
                key: "h2h",
                outcomes: [
                  { name: "Bears", price: -120 },
                  { name: "Packers", price: 100 },
                ],
              },
            ],
          },
          {
            key: "fanduel",
            title: "FanDuel",
            markets: [
              {
                key: "h2h",
                outcomes: [
                  { name: "Bears", price: -115 },
                  { name: "Packers", price: 105 },
                ],
              },
            ],
          },
        ],
      },
    ];

    const out = aggregate(games);
    expect(out.length).toBe(1);
    const h2h = out[0]?.markets.find((m) => m.market === "h2h");
    expect(h2h?.bestLines.length).toBe(2);
    const bestPackers = h2h?.bestLines.find((l) => l.side === "Packers");
    expect(bestPackers?.bestBook).toBe("fanduel");
    expect(bestPackers?.bestPrice).toBe(105);
  });

  it("handles a market with no books gracefully", () => {
    const games: RawGame[] = [
      {
        id: "g1",
        sport_key: "americanfootball_nfl",
        commence_time: "2026-09-08T20:00:00Z",
        home_team: "Bears",
        away_team: "Packers",
        bookmakers: [],
      },
    ];
    const out = aggregate(games);
    expect(out[0]?.markets.length).toBe(0);
  });
});
