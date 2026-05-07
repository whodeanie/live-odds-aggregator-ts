import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { AggregatedResponse } from "@loa/shared";
import { aggregate } from "./aggregate.js";
import { cacheKey, getCached, setCached } from "./cache.js";
import { loadSettings } from "./config.js";
import { fetchOdds } from "./odds-client.js";

export function buildApp(): Hono {
  const app = new Hono();
  app.use("*", logger());
  app.use("*", cors());

  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/v1/odds", async (c) => {
    const settings = loadSettings();
    if (!settings.oddsApiKey) {
      return c.json({ error: "ODDS_API_KEY not configured on server" }, 500);
    }
    const sport = c.req.query("sport") ?? settings.sport;
    const region = (c.req.query("region") ?? settings.region) as
      | "us"
      | "uk"
      | "eu"
      | "au";

    const key = cacheKey(sport, region);
    const cached = getCached(key);
    if (cached) {
      return c.json({ ...cached, cached: true } satisfies AggregatedResponse);
    }
    try {
      const raw = await fetchOdds({ apiKey: settings.oddsApiKey, sport, region });
      const games = aggregate(raw);
      const payload: AggregatedResponse = {
        fetchedAt: new Date().toISOString(),
        cached: false,
        ttlSeconds: settings.cacheTtlSeconds,
        games,
      };
      setCached(key, payload, settings.cacheTtlSeconds);
      return c.json(payload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "fetch failed";
      return c.json({ error: message }, 502);
    }
  });

  return app;
}
