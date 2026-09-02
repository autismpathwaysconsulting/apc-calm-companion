import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { guideOptions, parentPause } from "../src/content.js";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
const contentText = JSON.stringify([...guideOptions, parentPause]).toLowerCase();

assert.equal(guideOptions.length, 4, "the app must contain exactly four parent routes");
assert.equal(new Set(guideOptions.map((item) => item.id)).size, 4, "guide ids must be unique");
assert.equal(parentPause.id, "parent-pause", "the parent pause must remain separate from the four routes");

for (const required of [
  "Not for emergencies.",
  "call 999 in Malaysia",
  "It is not therapy, diagnosis, assessment, medical advice or crisis support.",
  "Tool entries stay on this page",
  "No outcome is guaranteed.",
]) {
  assert.ok(appSource.includes(required), `missing boundary: ${required}`);
}

for (const required of [
  "Feedback is not monitored for urgent help",
  "No account, name or email required",
  "No child profile or selected action is attached",
  'fetch("/api/feedback"',
]) assert.ok(feedbackSource.includes(required), `missing feedback boundary: ${required}`);

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
  assert.equal(`${appSource}\n${feedbackSource}`.includes(mechanism), false, `unexpected data mechanism: ${mechanism}`);
}

assert.equal((feedbackSource.match(/fetch\(/g) || []).length, 1, "only one submission call is allowed");
assert.equal(feedbackSource.includes("activeGuide"), false, "selected actions must not be submitted");

console.log("APP RELEASE VERIFICATION PASSED");
