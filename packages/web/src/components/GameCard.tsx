"use client";

import type { AggregatedGame } from "@loa/shared";

function fmtAmerican(n: number): string {
  if (n >= 0) return `+${n}`;
  return `${n}`;
}

function evClass(ev: number): string {
  return ev > 0 ? "ev-pos" : "ev-neg";
}

export function GameCard({ game }: { game: AggregatedGame }) {
  return (
    <div className="game">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h2>
          {game.awayTeam} <span className="muted">at</span> {game.homeTeam}
        </h2>
        <span className="muted">{new Date(game.commenceTime).toLocaleString()}</span>
      </div>
      {game.markets.map((m) => (
        <div key={m.market} style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 4 }}>
            <span className="tag">{m.market}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Side</th>
                <th>Best price</th>
                <th>Best book</th>
                <th>Fair</th>
                <th>EV</th>
              </tr>
            </thead>
            <tbody>
              {m.bestLines.map((b) => (
                <tr key={`${m.market}-${b.side}`}>
                  <td>
                    {b.side}
                    {b.point !== null ? (
                      <span className="muted"> ({b.point})</span>
                    ) : null}
                  </td>
                  <td>{fmtAmerican(b.bestPrice)}</td>
                  <td>{b.bestBook}</td>
                  <td>{fmtAmerican(b.fairPrice)}</td>
                  <td className={evClass(b.evPercent)}>
                    {(b.evPercent * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
