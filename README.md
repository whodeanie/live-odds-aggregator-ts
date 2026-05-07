# live-odds-aggregator-ts

TypeScript reimplementation of [live-odds-aggregator](https://github.com/whodeanie/live-odds-aggregator). Hono backend, Next.js frontend, shared types and math via an internal monorepo workspace.

> Educational analytics. Not investment or wagering advice.

## What it does

Polls the Odds API across five plus sportsbooks (DraftKings, FanDuel, BetMGM, Caesars, PointsBet US) for spreads, totals, and money lines. Surfaces the best available price per side and computes:

1. **No vig fair price.** Strips vig from the implied probability pair (`pA / (pA + pB)`) and back computes a fair American line.
2. **EV uplift.** `fairProb * decimalOddsOffered - 1`. Positive means the offered line beats the model's fair price. Highlighted green; negative is amber.
3. **Freshness indicator.** Live counter on the dashboard with a color band: green under 30s, amber under 90s, red beyond.

## Repo layout (npm workspaces monorepo)

```
packages/
  shared/   pure types and math (no vig, EV, best line). Imported by both web and server.
    src/{types,no-vig,best-line,index}.ts
    tests/no-vig.test.ts
  server/   Hono on Node, in memory TTL cache, OddsAPI client.
    src/{config,odds-client,aggregate,cache,app,index}.ts
    tests/aggregate.test.ts
  web/      Next.js 15 App Router dashboard.
    src/{app/{layout,page,globals.css},components/{GameCard,Freshness},lib/api}.ts(x)
```

## Why this stack

| Concern        | Choice              | Why                                                             |
| -------------- | ------------------- | --------------------------------------------------------------- |
| Backend        | Hono                | Tiny, fast, runs on Node, Bun, Cloudflare Workers, Vercel Edge. |
| Server runtime | @hono/node-server   | Deploy to Render free tier. Switch adapters without rewriting.  |
| Frontend       | Next.js 15          | Vercel free tier. RSC ready. Familiar.                          |
| Shared math    | npm workspace pkg   | One source of truth for types and EV math.                      |
| Validation     | Zod                 | Catches OddsAPI schema drift at the boundary.                   |
| Cache          | In memory TTL       | Keeps the OddsAPI free tier alive across rapid refreshes.       |

## Run locally

```bash
cp .env.example .env
# set ODDS_API_KEY in .env
npm install                    # installs all workspaces
npm run dev:server             # http://localhost:8787
npm run dev:web                # http://localhost:3000 (in another terminal)
```

The server reads `.env`. The web app reads `NEXT_PUBLIC_API_BASE` to know where the server lives.

## Tests

```bash
npm run test         # runs tests in every workspace
npm run typecheck
```

## Deploy

1. **Frontend.** Vercel free tier on `packages/web`. Set `NEXT_PUBLIC_API_BASE` to the deployed server URL.
2. **Backend, choice A: Render free tier.** Web service, root dir `packages/server`, build `npm install && npm run build`, start `npm start`. Set `ODDS_API_KEY` env var.
3. **Backend, choice B: Cloudflare Workers.** Hono runs on Workers without code changes. Swap `@hono/node-server` for the default fetch handler. CF Workers free tier is generous (100k requests / day).

## License

MIT.
