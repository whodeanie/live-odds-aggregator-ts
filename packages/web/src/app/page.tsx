"use client";

import { useCallback, useEffect, useState } from "react";
import type { AggregatedResponse } from "@loa/shared";
import { Freshness } from "@/components/Freshness";
import { GameCard } from "@/components/GameCard";
import { fetchAggregated } from "@/lib/api";

export default function HomePage() {
  const [sport, setSport] = useState("americanfootball_nfl");
  const [region, setRegion] = useState("us");
  const [data, setData] = useState<AggregatedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAggregated(sport, region));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "fetch failed");
    } finally {
      setLoading(false);
    }
  }, [sport, region]);

  useEffect(() => {
    void load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <main>
      <h1>Live odds aggregator</h1>
      <p className="muted">
        Best price per market across five plus sportsbooks. Fair price computed by stripping vig
        from the no vig pair. EV uplift percent shown per side.
      </p>

      <div className="card" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label className="muted">Sport</label>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option value="americanfootball_nfl">NFL</option>
          <option value="basketball_nba">NBA</option>
          <option value="baseball_mlb">MLB</option>
          <option value="icehockey_nhl">NHL</option>
        </select>
        <label className="muted">Region</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="us">US</option>
          <option value="uk">UK</option>
          <option value="eu">EU</option>
          <option value="au">AU</option>
        </select>
        <button onClick={load} disabled={loading}>
          {loading ? "loading..." : "refresh"}
        </button>
        {data ? <Freshness fetchedAt={data.fetchedAt} cached={data.cached} /> : null}
      </div>

      {error ? (
        <div className="card" style={{ borderColor: "var(--warn)", color: "var(--warn)" }}>
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>
        {data?.games.map((g) => <GameCard key={g.gameId} game={g} />)}
        {data && data.games.length === 0 ? (
          <p className="muted">No games available right now for {sport} ({region}).</p>
        ) : null}
      </div>
    </main>
  );
}
