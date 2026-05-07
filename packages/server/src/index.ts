/* eslint-disable no-console */
import { serve } from "@hono/node-server";
import { buildApp } from "./app.js";
import { loadSettings } from "./config.js";

const settings = loadSettings();
const app = buildApp();

serve({ fetch: app.fetch, port: settings.port }, (info) => {
  console.log(`[loa-server] listening on http://localhost:${info.port}`);
});
