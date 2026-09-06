import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const feedbackSource = await readFile(new URL("../src/FeedbackForm.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
const buildScript = await readFile(new URL("../scripts/generate-sw.mjs", import.meta.url), "utf8");
const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("approved visual interface retains its primary tools", () => {
  for (const label of ["Calm Reset", "What should I do right now?", "Quick communication board", "First / Then Board", "Visual Timer"]) {
    assert.ok(appSource.includes(label), `missing original interface element: ${label}`);
  }
});

test("primary tools use persistent view navigation instead of one long page", () => {
  for (const view of ["home", "calm", "routine", "communication", "tools"]) {
    assert.ok(appSource.includes(`[\"${view}\"`), `missing dock destination: ${view}`);
  }
  assert.ok(appSource.includes('className="apc-nav-dock"'));
  assert.ok(appSource.includes('aria-current={activeView === view ? "page" : undefined}'));
  assert.ok(appSource.includes('hidden={activeView !== "calm"}'));
  assert.ok(appSource.includes('hidden={activeView !== "tools"}'));
  assert.ok(styles.includes("[hidden]"));
});

test("first visit presents visual choices and Calm Reset escalation access", () => {
  assert.ok(appSource.includes("apc-calm-companion-onboarding-seen"));
  assert.ok(appSource.includes('id="first-visit-title"'));
  for (const label of ["Calm Reset", "Routine", "Communication", "Tools", "Things are escalating"]) {
    assert.ok(appSource.includes(label), `missing first-use choice: ${label}`);
  }
  assert.ok(styles.includes(".apc-first-visit-grid"));
  assert.ok(styles.includes(".apc-nav-item[aria-current=\"page\"]"));
});

test("audience-test routine separates child use from parent editing", () => {
  assert.ok(appSource.includes('name="routine" /> Use routine'));
  assert.ok(appSource.includes('name="tools" /> Edit routine'));
  assert.ok(appSource.includes("routineEditMode && <button"));
  assert.ok(appSource.includes("Routine changes are not saved."));
  assert.ok(appSource.includes('Bedtime: ['));
  assert.equal(appSource.includes("bedtimeMode"), false);
});

test("optional tool guidance stays collapsed until requested", () => {
  assert.ok(appSource.includes("Guidance & notes"));
  assert.ok(appSource.includes('hidden={activeView !== "tools" || !parentInstructionsOpen}'));
  assert.ok(appSource.includes('aria-controls="parent-support"'));
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
  assert.ok(appSource.includes('openView("help", "install-guide")'));
  assert.ok(manifest.icons.some((icon) => icon.purpose?.split(" ").includes("maskable")));
  assert.equal((appSource.match(/id="timer-visual"/g) || []).length, 1);
});

test("mobile tool selection is compact and decorative emoji stay out of accessible names", () => {
  assert.ok(appSource.includes('className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4"'));
  assert.ok(appSource.includes('aria-label={item.label}'));
  assert.ok(appSource.includes('aria-label={`${card.title}: ${card.words}`}'));
  assert.ok(appSource.includes('aria-hidden="true" className="text-3xl">{card.icon}'));
});

test("motion reduction and offline caching are explicit", () => {
  assert.ok(styles.includes("prefers-reduced-motion: reduce"));
  assert.ok(buildScript.includes('cache.addAll(CORE_FILES)'));
  assert.ok(buildScript.includes('caches.match("/index.html")'));
});

test("mobile home uses compact section stops and a visible feedback action", () => {
  assert.ok(appSource.includes('className="apc-home-feedback h-14 w-full gap-2 text-base"'));
  assert.ok(appSource.includes('<ApcIcon name="feedback" /> Give feedback'));
  assert.ok(appSource.includes("apc-section-stop"));
  assert.ok(appSource.includes('activeView !== "home"'));
  assert.ok(styles.includes("scroll-snap-type: y proximity"));
  assert.ok(styles.includes("scroll-snap-stop: always"));
  assert.ok(styles.includes(".apc-home-actions"));
});

test("brand refinement uses the shared typography, tokens, and APC icon system", async () => {
  const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
  const iconSource = await readFile(new URL("../src/ApcIcon.jsx", import.meta.url), "utf8");
  assert.ok(mainSource.includes("@fontsource/dm-sans"));
  assert.ok(mainSource.includes("@fontsource/dm-serif-display"));
  assert.ok(styles.includes('--apc-font-display: "DM Serif Display"'));
  assert.ok(styles.includes("--apc-radius-card: 1.5rem"));
  assert.ok(styles.includes("--apc-duration-base: 200ms"));
  for (const icon of ["home", "calm", "routine", "communication", "tools", "feedback", "install", "help"]) {
    assert.ok(iconSource.includes(`${icon}:`), `missing APC icon: ${icon}`);
  }
});

test("home prioritises four tools and moves secondary content to Help", () => {
  for (const destination of ["calm", "routine", "communication", "tools"]) {
    assert.ok(appSource.includes(`openView("${destination}")`), `missing primary destination: ${destination}`);
  }
  assert.ok(appSource.includes('"#help": "help"'));
  assert.ok(appSource.includes('hidden={activeView !== "help"}'));
  assert.ok(appSource.includes("Help & install"));
  assert.equal(appSource.includes("openBedtimeRoutine"), false);
});

test("date picker is clipped inside a bounded visual control", () => {
  assert.ok(appSource.includes('className="apc-date-control mt-4"'));
  assert.ok(appSource.includes('className="apc-date-native"'));
  assert.ok(styles.includes(".apc-date-control"));
  assert.ok(styles.includes("overflow: hidden"));
  assert.ok(styles.includes(".apc-date-native"));
  assert.ok(styles.includes("position: absolute"));
  assert.ok(styles.includes("max-width: 100%"));
  assert.ok(styles.includes("min-width: 0"));
});
