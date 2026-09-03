import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../dist/", import.meta.url);
const rootPath = fileURLToPath(root);

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

const files = await filesUnder(rootPath);
const names = files.map((path) => relative(rootPath, path).split(sep).join("/"));
for (const forbidden of ["cj-photo.JPG", "icons.svg", "favicon.svg", "hero.png", "react.svg", "vite.svg"]) {
  assert.equal(names.includes(forbidden), false, `unused asset was published: ${forbidden}`);
}

for (const required of ["index.html", "sw.js", "manifest.webmanifest", "_headers", "icon-192.png", "icon-512.png"]) {
  assert.ok(names.includes(required), `missing production file: ${required}`);
}

const sw = await readFile(new URL("../dist/sw.js", import.meta.url), "utf8");
assert.match(sw, /const CACHE_NAME = "apc-calm-[0-9a-f]{12}";/);
assert.match(sw, /\/assets\/index-[^"']+\.js/);
assert.match(sw, /\/assets\/index-[^"']+\.css/);
assert.ok(sw.includes('caches.match("/index.html")'), "offline navigation fallback is missing");
assert.ok(sw.includes('event.request.method !== "GET"'), "non-GET requests must bypass the offline cache");

const headers = await readFile(new URL("../dist/_headers", import.meta.url), "utf8");
for (const header of ["Content-Security-Policy:", "Strict-Transport-Security:", "X-Content-Type-Options: nosniff", "Referrer-Policy:"]) {
  assert.ok(headers.includes(header), `missing security header: ${header}`);
}
assert.ok(headers.includes("script-src 'self' https://challenges.cloudflare.com"), "Turnstile script is not allowed by CSP");
assert.ok(headers.includes("frame-src https://challenges.cloudflare.com"), "Turnstile frame is not allowed by CSP");

const index = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
for (const marker of ["rel=\"canonical\"", "property=\"og:title\"", "name=\"description\"", "manifest.webmanifest"]) {
  assert.ok(index.includes(marker), `missing metadata: ${marker}`);
}

for (const file of files.filter((path) => path.endsWith(".js"))) {
  const source = await readFile(file, "utf8");
  assert.equal(source.includes("TURNSTILE_SECRET_KEY"), false, "a Turnstile secret identifier reached the client bundle");
}

for (const file of files) assert.ok((await stat(file)).size > 0, `empty production file: ${file}`);

console.log("APP BUILD VERIFICATION PASSED");
