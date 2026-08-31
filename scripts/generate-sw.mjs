import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const dist = new URL("../dist/", import.meta.url);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

const distPath = dist.pathname;
const allFiles = await listFiles(distPath);
const cacheableFiles = allFiles
  .filter((path) => !path.endsWith("/sw.js") && !path.endsWith("/_headers"))
  .map((path) => `/${relative(distPath, path).split(sep).join("/")}`)
  .sort();

if (!cacheableFiles.includes("/index.html")) throw new Error("Built index.html was not found");
if (!cacheableFiles.some((path) => path.startsWith("/assets/"))) throw new Error("Built app assets were not found");

const fingerprintHash = createHash("sha256");
for (const path of allFiles.sort()) {
  if (path.endsWith("/sw.js")) continue;
  fingerprintHash.update(relative(distPath, path));
  fingerprintHash.update("\0");
  fingerprintHash.update(await readFile(path));
  fingerprintHash.update("\0");
}
const fingerprint = fingerprintHash.digest("hex").slice(0, 12);

const serviceWorker = `const CACHE_NAME = "apc-calm-${fingerprint}";
const CORE_FILES = ${JSON.stringify(["/", ...cacheableFiles], null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("apc-calm-") && key !== CACHE_NAME).map((key) => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", response.clone()));
      return response;
    }).catch(() => caches.match("/index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
`;

await writeFile(new URL("../dist/sw.js", import.meta.url), serviceWorker);
console.log(`Generated offline cache for ${cacheableFiles.length} files (${fingerprint})`);
