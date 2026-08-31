import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes } from "../src/content.js";

test("the parent guide contains exactly eight bounded actions", () => {
  assert.equal(guideOptions.length, 8);
  assert.equal(new Set(guideOptions.map((item) => item.id)).size, 8);
  assert.ok(guideOptions.every((item) => item.title && item.steps.length === 3 && item.notice));
});

test("communication options include essential refusal and health responses", () => {
  const labels = new Set(communicationOptions.map((item) => item.label));
  for (const label of ["Help", "Break", "No", "Stop", "Toilet", "Pain"]) assert.ok(labels.has(label));
});

test("each evidence note has a secure source link", () => {
  assert.ok(evidenceNotes.every((item) => item.url.startsWith("https://") && item.title && item.summary));
});

test("timer input is constrained to one through sixty minutes", () => {
  assert.equal(normaliseMinutes("0"), 1);
  assert.equal(normaliseMinutes("12"), 12);
  assert.equal(normaliseMinutes("99"), 60);
  assert.equal(normaliseMinutes("invalid"), 1);
});

test("timer formats remaining seconds", () => {
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(65), "1:05");
  assert.equal(formatTime(-10), "0:00");
});

test("parent guidance excludes unsafe or overconfident wording", () => {
  const text = JSON.stringify(guideOptions).toLowerCase();
  for (const phrase of [
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
    assert.equal(text.includes(phrase), false, `unexpected phrase: ${phrase}`);
  }
});

test("the app source contains no persistence, analytics or app-origin submission", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const token of ["localStorage", "sessionStorage", "indexedDB", "sendBeacon", "fetch(", "XMLHttpRequest", "gtag(", "fbq("]) {
    assert.equal(source.includes(token), false, `unexpected data mechanism: ${token}`);
  }
});

test("the skip link target is focusable and selected action descriptions meet text contrast", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.css", import.meta.url), "utf8");

  assert.ok(source.includes('<main id="main-content" tabIndex="-1">'));

  const foreground = css.match(/\.guide-choice small\s*\{[^}]*color:\s*(#[0-9a-f]{6})/i)?.[1];
  const background = css.match(/\.guide-choice\.selected\s*\{[^}]*background:\s*(#[0-9a-f]{6})/i)?.[1];
  assert.ok(foreground && background, "selected guide colours could not be read");

  function luminance(hex) {
    return [1, 3, 5]
      .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  }

  const first = luminance(foreground);
  const second = luminance(background);
  const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  assert.ok(ratio >= 4.5, `selected action description contrast is ${ratio.toFixed(2)}:1`);
});
