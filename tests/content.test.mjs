import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes, parentPause } from "../src/content.js";

test("the parent guide contains four routes and one separate parent pause", () => {
  assert.equal(guideOptions.length, 4);
  assert.equal(new Set(guideOptions.map((item) => item.id)).size, 4);
  assert.ok(guideOptions.every((item) => item.prompt && item.title && item.now && item.steps.length === 3 && item.notice));
  assert.ok(parentPause.prompt && parentPause.title && parentPause.steps.length === 3);
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
  const text = JSON.stringify([...guideOptions, parentPause]).toLowerCase();
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

test("the app has no persistence or analytics and submits only to the feedback endpoint", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  const source = `${appSource}\n${feedbackSource}`;
  for (const token of ["localStorage", "sessionStorage", "indexedDB", "sendBeacon", "XMLHttpRequest", "gtag(", "fbq("]) {
    assert.equal(source.includes(token), false, `unexpected data mechanism: ${token}`);
  }
  assert.equal((source.match(/fetch\(/g) || []).length, 1);
  assert.ok(source.includes('fetch("/api/feedback"'));
  assert.equal(source.includes("activeGuide.id"), false);
  assert.equal(source.includes("innerHTML"), false);
});

test("the skip link target is focusable and action descriptions meet text contrast", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");

  assert.ok(source.includes('<main id="main-content" tabIndex="-1">'));

  const foreground = css.match(/\.guide-choice small\s*\{[^}]*color:\s*(#[0-9a-f]{6})/i)?.[1];
  const background = css.match(/--surface:\s*(#[0-9a-f]{6})/i)?.[1];
  assert.ok(foreground && background, "guide colours could not be read");

  function luminance(hex) {
    return [1, 3, 5]
      .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
      .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  }

  const first = luminance(foreground);
  const second = luminance(background);
  const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  assert.ok(ratio >= 4.5, `action description contrast on ${background} is ${ratio.toFixed(2)}:1`);

  const tokens = Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
  for (const [foregroundName, backgroundName] of [
    ["primary", "surface"],
    ["primary-hover", "primary-tint"],
    ["danger-text", "danger-surface"],
    ["warm-text", "warm"],
  ]) {
    const foregroundLight = luminance(tokens[foregroundName]);
    const backgroundLight = luminance(tokens[backgroundName]);
    const tokenRatio = (Math.max(foregroundLight, backgroundLight) + 0.05) / (Math.min(foregroundLight, backgroundLight) + 0.05);
    assert.ok(tokenRatio >= 4.5, `${foregroundName} contrast is ${tokenRatio.toFixed(2)}:1`);
  }
});

test("the app defaults to a focused three-view navigation model", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.ok(source.includes('useState("actions")'));
  assert.ok(source.includes('const [activeGuide, setActiveGuide] = useState(null)'));
  assert.ok(source.includes('const [activeTool, setActiveTool] = useState(null)'));
  for (const label of ["Actions", "Tools", "More"]) assert.ok(source.includes(label));
  assert.equal(source.includes('className="hero page-width"'), false);
});

test("action and tool details use progressive disclosure", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const phrase of ["Try this now", "More guidance", "← All actions", "← All tools", "tool-menu"]) {
    assert.ok(source.includes(phrase), `missing progressive-disclosure element: ${phrase}`);
  }
  assert.ok(source.includes('ref={toolPanelRef} className="tool-panel" tabIndex="-1"'));
  assert.ok(source.includes("shouldFocusToolRef.current = true"));
  assert.equal(source.includes("function ToolButton"), false);
});

test("feedback is voluntary, bounded and separated from urgent support", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  for (const phrase of [
    "Was this useful? Send feedback",
    "Help improve this app",
    "Feedback is not monitored for urgent help",
    "Please do not include names, diagnoses, schools, contact details or private information about a child.",
    'maxLength="300"',
  ]) assert.ok(`${appSource}\n${feedbackSource}`.includes(phrase), `missing feedback safeguard: ${phrase}`);
  assert.equal(feedbackSource.includes("email"), true, "the no-email disclosure must remain visible");
});

test("feedback exposes secure loading, accessible errors and a removal reference", async () => {
  const source = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  for (const marker of [
    'size: "flexible"',
    'aria-required="true"',
    "firstHelpfulnessRef.current?.focus()",
    "REQUEST_TIMEOUT_MS",
    'setSecurityState("expired")',
    "Submission reference",
    "Comments older than 90 days are removed during APC’s monthly review",
    "Cloudflare Turnstile processes technical security data",
    "Secure feedback submission is not available in this preview",
  ]) assert.ok(source.includes(marker), `missing feedback readiness marker: ${marker}`);
});
