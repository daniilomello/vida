#!/usr/bin/env node
/**
 * Patches serverless-offline's cookie parser to correctly extract the cookie
 * value (stopping at the first semicolon) and set Path=/ so cookies work for
 * all routes. Without this patch, statehood rejects JWT tokens because it
 * receives the entire raw Set-Cookie string (value + attributes) as the value.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(
  import.meta.dirname,
  "../node_modules/serverless-offline/src/events/http/HttpServer.js",
);

const ORIGINAL = `\
        const parseCookies = (headerValue) => {
          const cookieName = headerValue.slice(0, headerValue.indexOf("="))
          const cookieValue = headerValue.slice(headerValue.indexOf("=") + 1)

          h.state(cookieName, cookieValue, {
            encoding: "none",
            strictHeader: false,
          })
        }`;

const PATCHED = `\
        const parseCookies = (headerValue) => {
          const eqIdx = headerValue.indexOf("=")
          const semiIdx = headerValue.indexOf(";")
          const cookieName = headerValue.slice(0, eqIdx)
          const cookieValue =
            semiIdx !== -1
              ? headerValue.slice(eqIdx + 1, semiIdx).trim()
              : headerValue.slice(eqIdx + 1)

          h.state(cookieName, cookieValue, {
            encoding: "none",
            strictHeader: false,
            path: "/",
          })
        }`;

let src;
try {
  src = readFileSync(target, "utf8");
} catch {
  console.warn("[patch-serverless-offline] File not found — skipping.");
  process.exit(0);
}

if (src.includes(PATCHED)) {
  console.log("[patch-serverless-offline] Already patched — skipping.");
  process.exit(0);
}

if (!src.includes(ORIGINAL)) {
  console.warn(
    "[patch-serverless-offline] Could not find target block — serverless-offline may have changed. Skipping.",
  );
  process.exit(0);
}

writeFileSync(target, src.replace(ORIGINAL, PATCHED), "utf8");
console.log("[patch-serverless-offline] Applied cookie parser fix.");
