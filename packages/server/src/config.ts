import { z } from "zod";

const Schema = z.object({
  oddsApiKey: z.string().default(""),
  region: z.enum(["us", "uk", "eu", "au"]).default("us"),
  sport: z.string().default("americanfootball_nfl"),
  cacheTtlSeconds: z.number().int().nonnegative().default(60),
  port: z.number().int().positive().default(8787),
});

export type Settings = z.infer<typeof Schema>;

export function loadSettings(): Settings {
  return Schema.parse({
    oddsApiKey: process.env.ODDS_API_KEY ?? "",
    region: process.env.ODDS_API_REGION ?? "us",
    sport: process.env.ODDS_API_SPORT ?? "americanfootball_nfl",
    cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? "60"),
    port: Number(process.env.PORT ?? "8787"),
  });
}
