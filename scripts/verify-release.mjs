import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { guideOptions } from "../src/content.js";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const contentText = JSON.stringify(guideOptions).toLowerCase();

assert.equal(guideOptions.length, 8, "the app must contain exactly eight bounded parent actions");
assert.equal(new Set(guideOptions.map((item) => item.id)).size, 8, "guide ids must be unique");

for (const required of [
  "Not for emergencies.",
  "call 999 in Malaysia",
  "It is not therapy, diagnosis, assessment, medical advice or crisis support.",
  "Nothing entered in these tools is saved or sent by the app",
  "No outcome is guaranteed.",
]) {
  assert.ok(appSource.includes(required), `missing boundary: ${required}`);
}

for (const forbidden of [
  "block safely",
  "deep pressure",
  "non-compliance",
  "calm body",
  "will calm",
  "prevent meltdown",
  "message may be getting lost",
  "too much to hold at once",
  "control may make",
  "speech may not be",
  "something around the person may be",
]) {
  assert.equal(contentText.includes(forbidden), false, `inferred or unsafe wording remains: ${forbidden}`);
}

for (const mechanism of ["localStorage", "sessionStorage", "indexedDB", "sendBeacon", "XMLHttpRequest", "gtag(", "fbq("]) {
  assert.equal(appSource.includes(mechanism), false, `unexpected data mechanism: ${mechanism}`);
}

console.log("APP RELEASE VERIFICATION PASSED");
