import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
const buildScript = await readFile(new URL("../scripts/generate-sw.mjs", import.meta.url), "utf8");

test("approved visual interface retains its primary tools", () => {
  for (const label of ["Get calm support", "What should I do right now?", "Quick communication board", "First / Then Board", "Visual Timer"]) {
    assert.ok(appSource.includes(label), `missing original interface element: ${label}`);
  }
});

test("device persistence requires explicit consent", () => {
  assert.ok(appSource.includes('apc-calm-companion-storage-consent'));
  assert.ok(appSource.includes('if (!storageEnabled) return;'));
  assert.ok(appSource.includes('Save on this device'));
});

test("all core form controls have programmatic labels", () => {
  for (const id of [
    "selected-date",
    "child-name",
    "main-challenge",
    "research-topic",
    "routine-template",
    "new-routine-step",
    "new-routine-icon",
    "first-task",
    "then-task",
    "timer-visual",
    "timer-purpose",
    "timer-minutes",
    "note-before",
    "note-during",
    "note-helped",
  ]) {
    assert.ok(appSource.includes(`htmlFor="${id}"`), `missing label for ${id}`);
    assert.ok(appSource.includes(`id="${id}"`), `missing control id ${id}`);
  }
});

test("communication board is a focus-managed modal", () => {
  assert.ok(appSource.includes('role="dialog"'));
  assert.ok(appSource.includes('aria-modal="true"'));
  assert.ok(appSource.includes('trapCommunicationFocus'));
  assert.ok(appSource.includes('event.key !== "Escape"'));
  assert.ok(appSource.includes('createPortal'));
});

test("feedback uses the secure same-origin endpoint and never mailto", () => {
  assert.ok(feedbackSource.includes('fetch("/api/feedback"'));
  assert.equal(appSource.includes("mailto:"), false);
  for (const privateField of ["childName", "mainChallenge", "savedNotes", "rewardLog"]) {
    assert.equal(feedbackSource.includes(privateField), false, `feedback must not include ${privateField}`);
  }
});

test("install help uses exact visual assets and the native prompt path", () => {
  for (const asset of ["install-safari.png", "install-apple-share.png", "install-apple-home.png", "install-chrome.png", "install-android-menu.svg", "install-android-home.svg"]) {
    assert.ok(appSource.includes(asset), `missing install visual ${asset}`);
  }
  assert.ok(appSource.includes("installPrompt.prompt()"));
  assert.equal((appSource.match(/id="timer-visual"/g) || []).length, 1);
});

test("motion reduction and offline caching are explicit", () => {
  assert.ok(styles.includes("prefers-reduced-motion: reduce"));
  assert.ok(buildScript.includes('cache.addAll(CORE_FILES)'));
  assert.ok(buildScript.includes('caches.match("/index.html")'));
});
