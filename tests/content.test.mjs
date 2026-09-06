import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes, parentPause, secondsUntilDeadline } from "../src/content.js";
import { turnstileSizeForWidth } from "../src/feedback-utils.js";
import { appHash, parseAppHash } from "../src/navigation.js";
import { formatToday, loadProfileName, normaliseProfileName, profileInitials, PROFILE_STORAGE_KEY, saveProfileName } from "../src/profile.js";

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

test("timer uses a deadline so background time is not lost", () => {
  assert.equal(secondsUntilDeadline(400_000, 100_000), 300);
  assert.equal(secondsUntilDeadline(400_000, 250_500), 150);
  assert.equal(secondsUntilDeadline(400_000, 401_000), 0);
  assert.equal(secondsUntilDeadline(Number.NaN, 100_000), 0);
});

test("Turnstile uses its compact mobile layout below 300 pixels", () => {
  assert.equal(turnstileSizeForWidth(254), "compact");
  assert.equal(turnstileSizeForWidth(299), "compact");
  assert.equal(turnstileSizeForWidth(300), "flexible");
  assert.equal(turnstileSizeForWidth(420), "flexible");
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

test("tool content has no persistence or analytics and submits only to the feedback endpoint", async () => {
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

test("the optional profile stores only a short display name on the device", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };

  assert.equal(normaliseProfileName("  Aina   Sofea  "), "Aina Sofea");
  assert.equal(normaliseProfileName("x".repeat(40)).length, 24);
  assert.equal(saveProfileName("  Aina  ", storage), "Aina");
  assert.deepEqual(JSON.parse(values.get(PROFILE_STORAGE_KEY)), { version: 1, displayName: "Aina" });
  assert.equal(loadProfileName(storage), "Aina");
  assert.equal(saveProfileName("", storage), "");
  assert.equal(values.has(PROFILE_STORAGE_KEY), false);
});

test("the profile badge uses first and last initials", () => {
  assert.equal(profileInitials("Jin Heng"), "JH");
  assert.equal(profileInitials("Jin Wei Heng"), "JH");
  assert.equal(profileInitials("Aina"), "A");
  assert.equal(profileInitials(""), "");
});

test("visible button labels remain part of their accessible names", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const label of ["Calm support", "Visual tools", "Routine", "Communication", "Install"]) {
    assert.ok(appSource.includes(`<span>${label}</span>`), `missing visible jump label: ${label}`);
  }
  assert.equal(appSource.includes('aria-label="Open Calm Companion'), false);
});

test("today uses the device date without storing a selected date", () => {
  const value = formatToday(new Date(2026, 8, 2), "en-MY");
  assert.match(value, /Wednesday/);
  assert.match(value, /2 September/);
});

test("the reel-reference interface does not collect child profile data", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  const profileSource = await readFile(new URL("../src/profile.js", import.meta.url), "utf8");
  for (const privateField of ["diagnosis", "birthDate", "dateOfBirth", "school", "photo"]) {
    assert.equal(profileSource.includes(privateField), false, `unexpected profile field: ${privateField}`);
  }
  assert.equal(feedbackSource.includes("profileName"), false);
  for (const privateField of ["childName", "childPhoto", "mainChallenge"]) {
    assert.equal(appSource.includes(privateField), false, `unexpected app profile field: ${privateField}`);
  }
});

test("the skip link target is focusable and semantic colours meet contrast", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");

  assert.ok(source.includes('<main id="main-content" className="legacy-width" tabIndex="-1">'));

  const tokens = Object.fromEntries([...css.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]));
  const foreground = tokens.muted;
  const background = tokens.surface;
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

test("the app restores the reel-reference single-page visual structure", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const id of ["calm-reset", "quick-tools", "routine", "communication", "safety"]) {
    assert.ok(source.includes(`id="${id}"`), `missing reel-reference section: ${id}`);
  }
  assert.ok(source.includes('className="legacy-jump-grid"'));
  assert.ok(source.includes('className="legacy-card calm-reset-section"'));
  assert.equal(source.includes("parseAppHash(window.location.hash)"), false);
});

test("navigation hashes are bounded, canonical and directly restorable", () => {
  assert.deepEqual(parseAppHash(""), { view: "actions", guideId: "", toolId: "", moreSection: "safety" });
  assert.deepEqual(parseAppHash("#actions/next-step"), { view: "actions", guideId: "next-step", toolId: "", moreSection: "safety" });
  assert.deepEqual(parseAppHash("#tools/timer"), { view: "tools", guideId: "", toolId: "timer", moreSection: "safety" });
  assert.deepEqual(parseAppHash("#more/install"), { view: "about", guideId: "", toolId: "", moreSection: "install" });
  assert.deepEqual(parseAppHash("#tools/not-a-tool"), { view: "tools", guideId: "", toolId: "", moreSection: "safety" });
  assert.deepEqual(parseAppHash("#unknown"), { view: "actions", guideId: "", toolId: "", moreSection: "safety" });
  assert.equal(appHash({ view: "actions", guideId: "respond" }), "#actions/respond");
  assert.equal(appHash({ view: "tools", toolId: "communication" }), "#tools/communication");
  assert.equal(appHash({ view: "about", moreSection: "evidence" }), "#more/evidence");
  assert.equal(appHash({ view: "about", moreSection: "invalid" }), "#more/safety");
});

test("the app exposes the reel tools plus bounded choices and observation support", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const tool of ["first-then", "choices", "timer", "calm", "communication", "observation"]) {
    assert.ok(source.includes(`id: "${tool}"`), `missing tool: ${tool}`);
  }
  assert.ok(source.includes("not assessment or proof of a cause"));
});

test("secure feedback opens inside the single-page interface", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");

  assert.ok(appSource.includes("const [feedbackOpen, setFeedbackOpen] = useState(false)"));
  assert.ok(appSource.includes("setFeedbackOpen(true)"));
  assert.ok(appSource.includes('<FeedbackForm headingRef={feedbackHeadingRef} hidden={false} />'));
  assert.ok(feedbackSource.includes("hidden={hidden}"), "feedback must remain mounted while hidden");
  assert.ok(appSource.includes('className="floating-feedback"'));
  assert.ok(css.includes("min-height: 50px"));
});

test("mobile timing and safe-area behavior are explicit", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.ok(appSource.includes("secondsUntilDeadline(timerDeadlineRef.current)"));
  assert.ok(appSource.includes('document.addEventListener("visibilitychange", updateTimer)'));
  assert.ok(html.includes("viewport-fit=cover"));
  assert.ok(css.includes("env(safe-area-inset-bottom)"));
  assert.ok(css.includes("100dvh"));
  assert.ok(css.includes("backdrop-filter: none"), "mobile header must not trap fixed bottom navigation");
});

test("visual tool labels can reflow without forcing horizontal page scrolling", async () => {
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");
  assert.match(css, /\.tool-menu button > span:nth-child\(2\)\s*\{[^}]*min-width:\s*0/i);
  assert.match(css, /\.tool-menu strong\s*\{[^}]*overflow-wrap:\s*anywhere/i);
  assert.match(css, /\.tool-menu small\s*\{[^}]*overflow-wrap:\s*anywhere/i);
  assert.ok(css.includes("@media (max-width: 480px)"));
  assert.ok(css.includes(".tool-menu button > span:nth-child(2) { grid-column: 1 / -1; grid-row: 1; }"));
});

test("mobile Home Screen instructions open as an accessible visual guide", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const phrase of [
    "Add Calm Companion to your phone Home Screen",
    "No App Store or Google Play download is needed.",
    "See pictures",
    "Add to Home Screen",
    "install-safari.png",
    "install-chrome.png",
    "install-apple-share.png",
    "install-apple-home.png",
    "install-android-menu.svg",
    "install-android-home.svg",
    "icon-192.png",
  ]) assert.ok(source.includes(phrase), `missing install guidance: ${phrase}`);
  for (const removedPhrase of ["Keep this page open while you add it.", "Menu names may look slightly different after a phone update."]) {
    assert.equal(source.includes(removedPhrase), false, `visual guide should not include extra copy: ${removedPhrase}`);
  }
  for (const asset of [
    "install-safari.png",
    "install-chrome.png",
    "install-apple-share.png",
    "install-apple-home.png",
    "install-android-menu.svg",
    "install-android-home.svg",
  ]) {
    const contents = await readFile(new URL(`../public/${asset}`, import.meta.url));
    assert.ok(contents.length > 100, `missing visual asset: ${asset}`);
  }
  assert.ok(source.includes("showModal()"));
  assert.ok(source.includes("aria-labelledby=\"visual-install-title\""));
  assert.ok(source.includes("onClose={() => installDialogTriggerRef.current?.focus()}"));
});

test("action and tool details use progressive disclosure", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const phrase of ["Try this now", "More guidance", "recommendation-panel", "active-tool-view", "quick-tool-tabs"]) {
    assert.ok(source.includes(phrase), `missing progressive-disclosure element: ${phrase}`);
  }
  assert.ok(source.includes('aria-pressed={activeTool === tool.id}'));
  assert.ok(source.includes("setActiveTool(id)"));
});

test("the opening interface stays faithful to the visual reel reference", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");

  assert.ok(source.includes("const routineTemplates"));
  assert.ok(source.includes("Automatic Calm Breathing"));
  assert.ok(source.includes("Quick communication board"));
  assert.ok(source.includes("<strong>{guide.label}</strong>"));
  assert.equal(source.includes("<small>{guide.short}</small>"), false);
  assert.ok(css.includes(".legacy-hero, .legacy-card, .legacy-footer"));
  assert.ok(css.includes(".scenario-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; }"));
  assert.ok(css.includes(".large-board { grid-template-columns: repeat(2,minmax(0,1fr)); }"));
});

test("feedback is voluntary, bounded and separated from urgent support", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  for (const phrase of [
    "Give app feedback",
    "Help improve this app",
    "Feedback is not monitored for urgent help",
    "Please do not include names, diagnoses, schools, contact details or private information about a child.",
    'maxLength="300"',
  ]) assert.ok(`${appSource}\n${feedbackSource}`.includes(phrase), `missing feedback safeguard: ${phrase}`);
  assert.equal(feedbackSource.includes("email"), true, "the no-email disclosure must remain visible");
  assert.ok(appSource.includes('className="floating-feedback"'));
  assert.ok(appSource.includes('<button className="button light" type="button" onClick={openFeedback}>Give app feedback</button>'));
  assert.equal(appSource.includes("mailto:"), false, "feedback must not bypass the secure form");
});

test("feedback exposes secure loading, accessible errors and a removal reference", async () => {
  const source = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
  for (const marker of [
    "turnstileSizeForWidth",
    "size: widgetSize",
    'aria-required="true"',
    "firstHelpfulnessRef.current?.focus()",
    "REQUEST_TIMEOUT_MS",
    'setSecurityState("expired")',
    "Submission reference",
    "Copy reference",
    "navigator.clipboard?.writeText",
    "Comments older than 90 days are removed during APC’s monthly review",
    "Cloudflare Turnstile processes technical security data",
    "Secure feedback submission is not available in this preview",
  ]) assert.ok(source.includes(marker), `missing feedback readiness marker: ${marker}`);
});

test("interactive examples start empty and explain themselves with placeholders", async () => {
  const source = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  for (const state of ["firstStep", "thenStep", "choiceA", "choiceB"]) {
    assert.ok(source.includes(`const [${state}, set${state[0].toUpperCase()}${state.slice(1)}] = useState(\"\")`));
  }
  for (const placeholder of ["Shoes on", "Go to the car", "Blue shirt", "Green shirt"]) {
    assert.ok(source.includes(`placeholder=\"${placeholder}\"`), `missing placeholder: ${placeholder}`);
  }
});

test("the interface includes APC brand tokens, self-hosted fonts and accessible semantic colours", async () => {
  const css = await readFile(new URL("../src/App.modern.css", import.meta.url), "utf8");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const manifest = await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8");
  for (const token of ["--brand-teal: #2dd4bf", "--brand-coral: #e8997a", "--brand-sage: #6b9e7a", "--brand-cream: #fff9f1"]) {
    assert.ok(css.includes(token), `missing APC token: ${token}`);
  }
  assert.ok(css.includes('font-family: "Outfit"'));
  assert.ok(css.includes('font-family: "Work Sans"'));
  assert.ok(css.includes('url("/fonts/outfit-latin.woff2")'));
  assert.ok(css.includes('url("/fonts/work-sans-latin.woff2")'));
  assert.ok(html.includes('<meta name="theme-color" content="#0F766E"'));
  assert.ok(manifest.includes('"background_color": "#FFF9F1"'));
  assert.ok(manifest.includes('"theme_color": "#0F766E"'));
});

test("repeated evidence links have unique accessible names", async () => {
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.ok(appSource.includes('aria-label={`Open source: ${item.title}`}'));
});
