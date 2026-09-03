import { useEffect, useRef, useState } from "react";
import "./App.modern.css";
import FeedbackForm from "./FeedbackForm.jsx";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes, parentPause, secondsUntilDeadline } from "./content.js";
import { appHash, parseAppHash } from "./navigation.js";
import { formatToday, loadProfileName, profileInitials, saveProfileName } from "./profile.js";

const APC_URL = "https://autismpathwaysconsulting.com/";
const PRIVACY_URL = "https://autismpathwaysconsulting.com/privacy";
const TERMS_URL = "https://autismpathwaysconsulting.com/terms";
const EMERGENCY_URL = "https://www.malaysia.gov.my/en/categories/safety-and-community/public-safety/mers-999-emergency-line";
const BEFRIENDERS_URL = "https://befrienders.org.my/contact-us/";

const toolOptions = [
  { id: "first-then", label: "First, then", summary: "Show one step and what genuinely follows.", marker: "1 → 2" },
  { id: "choices", label: "Two choices", summary: "Show two options that are both available.", marker: "A / B" },
  { id: "timer", label: "Timer", summary: "Make the remaining time visible.", marker: "5:00" },
  { id: "communication", label: "Communication", summary: "Show simple ways to respond without requiring speech.", marker: "Yes / No" },
  { id: "observation", label: "Quick check", summary: "Notice one observable factor before changing one thing.", marker: "Look" },
];

const moreSections = [
  { id: "profile", label: "Profile" },
  { id: "safety", label: "Safety" },
  { id: "feedback", label: "Feedback" },
  { id: "privacy", label: "Privacy" },
  { id: "evidence", label: "Evidence" },
  { id: "install", label: "Install" },
];

const allGuides = [...guideOptions, parentPause];

const installGuides = {
  apple: {
    label: "iPhone or iPad",
    icon: "/install-safari.png",
    steps: [
      { label: "Safari", image: "/install-safari.png", kind: "browser" },
      { label: "Share", image: "/install-apple-share.png", kind: "action" },
      { label: "Add to Home Screen", image: "/install-apple-home.png", kind: "action" },
      { label: "Add", image: "/icon-192.png", kind: "app" },
    ],
  },
  android: {
    label: "Android",
    icon: "/install-chrome.png",
    steps: [
      { label: "Chrome", image: "/install-chrome.png", kind: "browser" },
      { label: "Menu", image: "/install-android-menu.svg", kind: "action" },
      { label: "Add to home screen", image: "/install-android-home.svg", kind: "action" },
      { label: "Install", image: "/icon-192.png", kind: "app" },
    ],
  },
};

function GuideIcon({ name }) {
  if (name === "words") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 6.5h14v9H9l-4 3v-12Z" />
        <path d="M9 11h6" />
      </svg>
    );
  }
  if (name === "step") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="7" cy="12" r="2.5" />
        <path d="M11 12h8m-3-3 3 3-3 3" />
      </svg>
    );
  }
  if (name === "respond") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 7.5h5v9H5zm9 0h5v9h-5zM10 12h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function focusHeading(headingRef) {
  window.requestAnimationFrame(() => {
    headingRef?.current?.focus();
    headingRef?.current?.scrollIntoView({ block: "start" });
  });
}

function isRunningInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function defaultInstallPlatform() {
  return /Android/i.test(window.navigator.userAgent) ? "android" : "apple";
}

export default function App() {
  const [initialRoute] = useState(() => parseAppHash(window.location.hash));
  const [activeView, setActiveView] = useState(initialRoute.view);
  const [activeGuide, setActiveGuide] = useState(() => allGuides.find((guide) => guide.id === initialRoute.guideId) || null);
  const [activeTool, setActiveTool] = useState(initialRoute.toolId || null);
  const [activeMoreSection, setActiveMoreSection] = useState(initialRoute.moreSection);
  const [firstStep, setFirstStep] = useState("");
  const [thenStep, setThenStep] = useState("");
  const [choiceA, setChoiceA] = useState("");
  const [choiceB, setChoiceB] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("Choose a communication option");
  const [voiceOn, setVoiceOn] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(isRunningInstalled);
  const [installPlatform, setInstallPlatform] = useState(defaultInstallPlatform);
  const [today, setToday] = useState(() => new Date());
  const [profileName, setProfileName] = useState(loadProfileName);
  const [profileDraft, setProfileDraft] = useState(profileName);
  const [profileStatus, setProfileStatus] = useState("");
  const actionsHeadingRef = useRef(null);
  const toolsHeadingRef = useRef(null);
  const moreHeadingRef = useRef(null);
  const guidePanelRef = useRef(null);
  const toolPanelRef = useRef(null);
  const safetyHeadingRef = useRef(null);
  const feedbackHeadingRef = useRef(null);
  const privacyHeadingRef = useRef(null);
  const evidenceHeadingRef = useRef(null);
  const installHeadingRef = useRef(null);
  const installDialogRef = useRef(null);
  const installDialogHeadingRef = useRef(null);
  const installDialogTriggerRef = useRef(null);
  const profileHeadingRef = useRef(null);
  const moreNavRef = useRef(null);
  const shouldMoveFocusRef = useRef(false);
  const shouldFocusToolRef = useRef(false);
  const shouldFocusMoreSectionRef = useRef(null);
  const timerDeadlineRef = useRef(null);
  const speechAvailable = "speechSynthesis" in window;

  useEffect(() => {
    const clockId = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(clockId);
  }, []);

  useEffect(() => {
    const canonicalHash = appHash(initialRoute);
    if (window.location.hash !== canonicalHash) window.history.replaceState(null, "", canonicalHash);

    function restoreRoute() {
      const route = parseAppHash(window.location.hash);
      setActiveView(route.view);
      setActiveGuide(allGuides.find((guide) => guide.id === route.guideId) || null);
      setActiveTool(route.toolId || null);
      setActiveMoreSection(route.moreSection);
      if (route.view === "tools" && route.toolId) shouldFocusToolRef.current = true;
      else if (route.view === "about") shouldFocusMoreSectionRef.current = route.moreSection;
      else shouldMoveFocusRef.current = true;
      window.scrollTo({ top: 0 });
    }

    window.addEventListener("popstate", restoreRoute);
    window.addEventListener("hashchange", restoreRoute);
    return () => {
      window.removeEventListener("popstate", restoreRoute);
      window.removeEventListener("hashchange", restoreRoute);
    };
  }, [initialRoute]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    function updateTimer() {
      const deadline = timerDeadlineRef.current;
      if (!Number.isFinite(deadline)) return;
      const nextRemaining = secondsUntilDeadline(deadline);
      setRemaining(nextRemaining);
      if (nextRemaining === 0) {
        timerDeadlineRef.current = null;
        setTimerRunning(false);
      }
    }
    updateTimer();
    const timerId = window.setInterval(updateTimer, 250);
    document.addEventListener("visibilitychange", updateTimer);
    return () => {
      window.clearInterval(timerId);
      document.removeEventListener("visibilitychange", updateTimer);
    };
  }, [timerRunning]);

  useEffect(() => {
    function captureInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () => setIsInstalled(isRunningInstalled());
    const markInstalled = () => setIsInstalled(true);
    if (displayMode.addEventListener) displayMode.addEventListener("change", updateDisplayMode);
    else displayMode.addListener(updateDisplayMode);
    window.addEventListener("appinstalled", markInstalled);
    return () => {
      if (displayMode.removeEventListener) displayMode.removeEventListener("change", updateDisplayMode);
      else displayMode.removeListener(updateDisplayMode);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  useEffect(() => {
    if (!shouldMoveFocusRef.current) return;
    shouldMoveFocusRef.current = false;
    if (activeView === "actions" && activeGuide) guidePanelRef.current?.focus();
    else if (activeView === "actions") actionsHeadingRef.current?.focus();
    else if (activeView === "tools") toolsHeadingRef.current?.focus();
    else moreHeadingRef.current?.focus();
  }, [activeGuide, activeTool, activeView]);

  useEffect(() => {
    if (!shouldFocusToolRef.current || activeView !== "tools" || !activeTool) return;
    shouldFocusToolRef.current = false;
    toolPanelRef.current?.focus();
  }, [activeTool, activeView]);

  useEffect(() => {
    const requestedSection = shouldFocusMoreSectionRef.current;
    if (!requestedSection || activeView !== "about" || requestedSection !== activeMoreSection) return;
    shouldFocusMoreSectionRef.current = null;
    const headingBySection = {
      profile: profileHeadingRef,
      safety: safetyHeadingRef,
      feedback: feedbackHeadingRef,
      privacy: privacyHeadingRef,
      evidence: evidenceHeadingRef,
      install: installHeadingRef,
    };
    focusHeading(headingBySection[requestedSection]);
  }, [activeMoreSection, activeView]);

  useEffect(() => {
    if (activeView !== "about") return;
    const selectedButton = moreNavRef.current?.querySelector('[aria-current="page"]');
    selectedButton?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeMoreSection, activeView]);

  function pushRoute(route) {
    const nextHash = appHash(route);
    if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
  }

  function chooseGuide(guide) {
    shouldMoveFocusRef.current = true;
    setActiveGuide(guide);
    setActiveView("actions");
    pushRoute({ view: "actions", guideId: guide.id });
  }

  function openView(view) {
    shouldMoveFocusRef.current = true;
    setActiveView(view);
    if (view === "actions") setActiveGuide(null);
    if (view === "tools") setActiveTool(null);
    pushRoute({ view, moreSection: activeMoreSection });
    window.scrollTo({ top: 0 });
  }

  function openMoreSection(section, moveFocus = false) {
    if (moveFocus && activeView === "about" && activeMoreSection === section) {
      const headingBySection = {
        profile: profileHeadingRef,
        safety: safetyHeadingRef,
        feedback: feedbackHeadingRef,
        privacy: privacyHeadingRef,
        evidence: evidenceHeadingRef,
        install: installHeadingRef,
      };
      focusHeading(headingBySection[section]);
      return;
    }
    if (moveFocus) shouldFocusMoreSectionRef.current = section;
    setActiveMoreSection(section);
    setActiveView("about");
    pushRoute({ view: "about", moreSection: section });
    if (!moveFocus) window.scrollTo({ top: 0 });
  }

  function openRelatedTool(tool) {
    shouldFocusToolRef.current = true;
    setActiveTool(tool);
    setActiveView("tools");
    pushRoute({ view: "tools", toolId: tool });
    window.scrollTo({ top: 0 });
  }

  function openTool(tool) {
    shouldFocusToolRef.current = true;
    setActiveTool(tool);
    pushRoute({ view: "tools", toolId: tool });
  }

  function returnToTools() {
    shouldMoveFocusRef.current = true;
    setActiveTool(null);
    pushRoute({ view: "tools" });
  }

  function openFeedback() {
    openMoreSection("feedback", true);
  }

  function openProfile() {
    setProfileDraft(profileName);
    setProfileStatus("");
    openMoreSection("profile", true);
  }

  function updateProfile(event) {
    event.preventDefault();
    const savedName = saveProfileName(profileDraft);
    setProfileName(savedName);
    setProfileDraft(savedName);
    setProfileStatus(savedName ? "Saved on this device." : "The app is now being used without a name.");
  }

  function removeProfile() {
    saveProfileName("");
    setProfileName("");
    setProfileDraft("");
    setProfileStatus("Name removed from this device.");
  }

  function updateMinutes(value) {
    const nextMinutes = normaliseMinutes(value);
    timerDeadlineRef.current = null;
    setMinutes(nextMinutes);
    setRemaining(nextMinutes * 60);
    setTimerRunning(false);
  }

  function resetTimer() {
    timerDeadlineRef.current = null;
    setTimerRunning(false);
    setRemaining(minutes * 60);
  }

  function toggleTimer() {
    if (timerRunning) {
      setRemaining(secondsUntilDeadline(timerDeadlineRef.current));
      timerDeadlineRef.current = null;
      setTimerRunning(false);
      return;
    }
    if (remaining <= 0) return;
    timerDeadlineRef.current = Date.now() + remaining * 1000;
    setTimerRunning(true);
  }

  function selectCommunicationOption(option) {
    setSelectedPhrase(option.phrase);
    if (!voiceOn || !speechAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(option.phrase);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  async function installApp() {
    if (!installPrompt) {
      openMoreSection("install", true);
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function openVisualInstallGuide(event) {
    installDialogTriggerRef.current = event.currentTarget;
    installDialogRef.current?.showModal();
    window.requestAnimationFrame(() => installDialogHeadingRef.current?.focus());
  }

  function closeVisualInstallGuide() {
    installDialogRef.current?.close();
  }

  const timerProgress = Math.max(0, Math.min(100, (remaining / (minutes * 60)) * 100));
  const todayLabel = formatToday(today);
  const profileLabel = profileName || "My child";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <aside className="safety-bar" aria-labelledby="safety-title">
        <div className="page-width safety-inner">
          <div>
            <strong id="safety-title">Not for emergencies.</strong>{" "}
            Immediate danger or serious injury: <a className="safety-call" href="tel:999">call 999 in Malaysia</a>.
          </div>
          <button className="safety-detail" type="button" onClick={() => openMoreSection("safety", true)}>Safety information</button>
        </div>
      </aside>

      <header className="site-header">
        <div className="page-width header-inner">
          <button className="brand" type="button" onClick={() => openView("actions")} aria-label="Open Calm Companion actions">
            <img src="/icon-192.png" alt="" />
            <span><strong>APC Calm Companion</strong><small>One clear next step</small></span>
          </button>
          <nav className="app-nav" aria-label="Main navigation">
            <button type="button" aria-current={activeView === "actions" ? "page" : undefined} onClick={() => openView("actions")}>Actions</button>
            <button type="button" aria-current={activeView === "tools" ? "page" : undefined} onClick={() => openView("tools")}>Tools</button>
            <button type="button" aria-current={activeView === "about" ? "page" : undefined} onClick={() => openView("about")}>More</button>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex="-1">
        {activeView === "actions" && <section id="choose" className="section page-width view-section" aria-labelledby="choose-title">
          <div className="action-heading-row">
            <div className="section-heading">
              <p className="today-label"><span>Today</span>{todayLabel}</p>
              <h1 id="choose-title" ref={!activeGuide ? actionsHeadingRef : undefined} tabIndex="-1">{profileName ? `What would help ${profileName} right now?` : "What would help right now?"}</h1>
              <p>Choose the closest match. You do not need to work out the cause first.</p>
            </div>
            <button className="profile-shortcut" type="button" onClick={openProfile} aria-label={`Open profile settings. Currently supporting ${profileLabel}`}>
              <span className="profile-avatar" aria-hidden="true">{profileName ? profileInitials(profileName) : "＋"}</span>
              <span><small>Supporting</small><strong>{profileLabel}</strong></span>
              <span className="profile-edit">Edit</span>
            </button>
          </div>
          {!activeGuide ? (
            <>
              <div className="guide-grid" aria-label="Parent action choices">
                {guideOptions.map((guide) => (
                  <button type="button" key={guide.id} className="guide-choice" onClick={() => chooseGuide(guide)}>
                    <span className="guide-icon-wrap"><GuideIcon name={guide.icon} /></span>
                    <span><strong>{guide.prompt}</strong><small>{guide.short}</small></span>
                    <span className="guide-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
              <button type="button" className="parent-pause" onClick={() => chooseGuide(parentPause)}>
                <span><strong>{parentPause.prompt}</strong><small>{parentPause.short}</small></span>
                <span aria-hidden="true">→</span>
              </button>
              {!isInstalled && (
                <aside className="home-install-callout" aria-labelledby="home-install-title">
                  <div>
                    <p className="section-label">Keep it close</p>
                    <h2 id="home-install-title">Add Calm Companion to your phone Home Screen</h2>
                    <p>Open it like an app when you need it. No App Store or Google Play download is needed.</p>
                  </div>
                  <button className="button secondary" type="button" onClick={openVisualInstallGuide}>See pictures</button>
                </aside>
              )}
            </>
          ) : (
            <article ref={guidePanelRef} className="guide-panel focused-guide" tabIndex="-1" aria-live="polite" aria-labelledby="guide-panel-title">
              <button type="button" className="back-button" onClick={() => { shouldMoveFocusRef.current = true; setActiveGuide(null); pushRoute({ view: "actions" }); }}>← All actions</button>
              <p className="guide-kicker">One option to try</p>
              <h2 id="guide-panel-title">{activeGuide.title}</h2>
              <div className="now-box"><span>Try this now</span><strong>{activeGuide.now}</strong></div>
              <div className="say-box"><span>You could say</span><strong>“{activeGuide.say}”</strong></div>
              {activeGuide.tools?.length > 0 && (
                <div className="related-tools" aria-label="Related visual tools">
                  {activeGuide.tools.map((toolId) => {
                    const tool = toolOptions.find((item) => item.id === toolId);
                    return <button type="button" className="text-button" key={toolId} onClick={() => openRelatedTool(toolId)}>Open {tool?.label}</button>;
                  })}
                </div>
              )}
              <details className="more-guidance">
                <summary>More guidance</summary>
                <ol>{activeGuide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <p className="notice-line"><strong>Notice:</strong> {activeGuide.notice}</p>
              </details>
              <button type="button" className="feedback-link" onClick={openFeedback}>Was this useful? Send feedback</button>
            </article>
          )}
        </section>}

        {activeView === "tools" && <section id="tools" className="section tools-section view-section" aria-labelledby="tools-title">
          <div className="page-width">
            <div className="section-heading">
              <h1 id="tools-title" ref={toolsHeadingRef} tabIndex="-1">Choose a visual tool</h1>
              <p>These tools support understanding and communication. They do not require a child to respond in a particular way.</p>
            </div>
            {!activeTool ? (
              <div className="tool-menu" aria-label="Visual tool choices">
                {toolOptions.map((tool) => (
                  <button type="button" key={tool.id} onClick={() => openTool(tool.id)}>
                    <span className="tool-marker" aria-hidden="true">{tool.marker}</span>
                    <span><strong>{tool.label}</strong><small>{tool.summary}</small></span>
                    <span className="tool-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            ) : (<>
            <button type="button" className="all-tools-button" onClick={returnToTools}>← All tools</button>
            <div ref={toolPanelRef} className="tool-panel" tabIndex="-1">
              {activeTool === "first-then" && (
                <div id="first-then-panel" className="tool-content">
                  <div className="tool-intro"><h2>First, then</h2><p>Use two short, concrete steps. “Then” should be accurate and realistically available.</p></div>
                  <div className="field-grid">
                    <label>First<input value={firstStep} maxLength="40" placeholder="For example, shoes on" onChange={(event) => setFirstStep(event.target.value)} /></label>
                    <label>Then<input value={thenStep} maxLength="40" placeholder="For example, go to the car" onChange={(event) => setThenStep(event.target.value)} /></label>
                  </div>
                  <div className="visual-board two-part" aria-label={`First ${firstStep || "blank"}, then ${thenStep || "blank"}`}>
                    <div><span>First</span><strong>{firstStep || "Add one step"}</strong></div>
                    <div><span>Then</span><strong>{thenStep || "Add what follows"}</strong></div>
                  </div>
                </div>
              )}

              {activeTool === "choices" && (
                <div id="choices-panel" className="tool-content">
                  <div className="tool-intro"><h2>Two manageable choices</h2><p>Offer only options that are genuinely available. A point, reach, look, gesture or spoken response can all communicate a choice.</p></div>
                  <div className="field-grid">
                    <label>Choice one<input value={choiceA} maxLength="40" placeholder="For example, blue shirt" onChange={(event) => setChoiceA(event.target.value)} /></label>
                    <label>Choice two<input value={choiceB} maxLength="40" placeholder="For example, green shirt" onChange={(event) => setChoiceB(event.target.value)} /></label>
                  </div>
                  <div className="visual-board two-part choices" aria-label={`Choice one ${choiceA || "blank"}, choice two ${choiceB || "blank"}`}>
                    <div><span>Choice 1</span><strong>{choiceA || "Add a choice"}</strong></div>
                    <div><span>Choice 2</span><strong>{choiceB || "Add a choice"}</strong></div>
                  </div>
                </div>
              )}

              {activeTool === "timer" && (
                <div id="timer-panel" className="tool-content timer-content">
                  <div className="tool-intro"><h2>Visual timer</h2><p>Use a timer only when knowing the remaining time is likely to help. Explain what will happen when it ends.</p></div>
                  <label className="minutes-field">Minutes<input type="number" min="1" max="60" inputMode="numeric" value={minutes} onChange={(event) => updateMinutes(event.target.value)} /></label>
                  <div className="timer-display" role="timer" aria-label={`${formatTime(remaining)} remaining`}>
                    <div className="timer-track" aria-hidden="true"><span style={{ width: `${timerProgress}%` }} /></div>
                    <strong>{formatTime(remaining)}</strong><span>remaining</span>
                  </div>
                  <p className="timer-note">This timer has no alarm or notification. Return to this screen to check it.</p>
                  <p className="sr-only" aria-live="polite">{remaining === 0 ? "Timer finished." : ""}</p>
                  <div className="button-row">
                    <button className="button primary" type="button" onClick={toggleTimer} disabled={remaining === 0}>{timerRunning ? "Pause" : "Start"}</button>
                    <button className="button secondary" type="button" onClick={resetTimer}>Reset</button>
                  </div>
                </div>
              )}

              {activeTool === "communication" && (
                <div id="communication-panel" className="tool-content">
                  <div className="tool-intro split-heading">
                    <div><h2>Simple communication options</h2><p>Model or show a response without requiring speech. Keep the child’s existing communication system available.</p></div>
                    <label className="toggle-label"><input type="checkbox" checked={voiceOn} disabled={!speechAvailable} onChange={(event) => setVoiceOn(event.target.checked)} /> Speak selected words</label>
                  </div>
                  <p className="selected-phrase" aria-live="polite">{selectedPhrase}</p>
                  {!speechAvailable && <p className="voice-note">Spoken playback is not available in this browser. The communication buttons still show the selected words.</p>}
                  <div className="communication-grid">
                    {communicationOptions.map((option) => (
                      <button type="button" key={option.label} aria-pressed={selectedPhrase === option.phrase} onClick={() => selectCommunicationOption(option)}>
                        <span aria-hidden="true">{option.icon}</span><strong>{option.label}</strong><small>{option.phrase}</small>
                      </button>
                    ))}
                  </div>
                  <p className="medical-note">Pain, illness, breathing difficulty, injury or a sudden concerning change may need medical assessment. Do not use the board to delay urgent care.</p>
                </div>
              )}

              {activeTool === "observation" && (
                <div id="observation-panel" className="tool-content">
                  <div className="tool-intro">
                    <h2>Quick observation check</h2>
                    <p>Notice only what you can see, hear or verify. This check cannot identify why something is happening.</p>
                  </div>
                  <div className="observation-grid" aria-label="Observable factors to check">
                    <article>
                      <span>1</span>
                      <h3>Safety and health</h3>
                      <p>Check for immediate danger, breathing difficulty, injury, pain, illness or a sudden concerning change. Stop using the app and seek appropriate help when needed.</p>
                    </article>
                    <article>
                      <span>2</span>
                      <h3>Communication access</h3>
                      <p>Is the person’s usual device, picture, object, sign, gesture or other response method available?</p>
                    </article>
                    <article>
                      <span>3</span>
                      <h3>Surroundings</h3>
                      <p>Notice what is observable about noise, light, crowding, temperature, clothing and available space.</p>
                    </article>
                    <article>
                      <span>4</span>
                      <h3>Task and timing</h3>
                      <p>Is one next step visible? Could the task be made shorter, clearer or easier to begin?</p>
                    </article>
                  </div>
                  <p className="observation-note">Change one reasonable factor, then notice what becomes easier, stays difficult or changes. This is observation, not assessment or proof of a cause.</p>
                </div>
              )}

            </div>
            </>)}
          </div>
        </section>}

        <div className="about-view" hidden={activeView !== "about"}>
          <section id="about" className="more-header" aria-labelledby="about-title">
            <div className="page-width">
              <div className="section-heading more-heading">
                <h1 id="about-title" ref={moreHeadingRef} tabIndex="-1">More</h1>
                <p>Safety, feedback and app information.</p>
              </div>
              <nav ref={moreNavRef} className="more-section-nav" aria-label="More sections">
                {moreSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    data-more-section={section.id}
                    aria-current={activeMoreSection === section.id ? "page" : undefined}
                    onClick={() => openMoreSection(section.id, true)}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </section>

          <section id="more-profile" className="section page-width more-panel" aria-labelledby="more-profile-title" hidden={activeMoreSection !== "profile"}>
            <div className="profile-layout">
              <div className="section-heading compact-heading">
                <p className="section-label">Optional profile</p>
                <h2 id="more-profile-title" ref={profileHeadingRef} tabIndex="-1">Make the app feel familiar</h2>
                <p>Add only a name or nickname if seeing it helps. The app works exactly the same without one.</p>
              </div>
              <form className="profile-card" onSubmit={updateProfile}>
                <label htmlFor="profile-name">Name or nickname</label>
                <input id="profile-name" value={profileDraft} maxLength="24" autoComplete="off" onChange={(event) => setProfileDraft(event.target.value)} placeholder="For example, Aina" />
                <p className="profile-privacy">Saved only in this browser on this device. It is never included with feedback. Avoid using a full legal name on a shared device.</p>
                <div className="button-row profile-actions">
                  <button className="button primary" type="submit">Save profile</button>
                  {profileName && <button className="button secondary" type="button" onClick={removeProfile}>Remove name</button>}
                </div>
                <p className="profile-status" role="status" aria-live="polite">{profileStatus}</p>
              </form>
            </div>
          </section>

          <section id="more-safety" className="section page-width more-panel" aria-labelledby="more-safety-title" hidden={activeMoreSection !== "safety"}>
            <div className="section-heading compact-heading">
              <p className="section-label">Safety</p>
              <h2 id="more-safety-title" ref={safetyHeadingRef} tabIndex="-1">Know when to stop using the app</h2>
              <p className="working-boundary">This is general educational support for everyday situations. It is not therapy, diagnosis, assessment, medical advice or crisis support.</p>
            </div>
            <aside className="emergency-card" aria-labelledby="emergency-card-title">
              <h3 id="emergency-card-title">When not to use this app</h3>
              <p>If anyone is in immediate danger, seriously injured, unable to breathe, at risk of running into danger, or you cannot keep people safe, call 999 in Malaysia or your local emergency service.</p>
              <div className="button-row"><a className="button emergency" href="tel:999">Call 999</a><a className="button secondary" href={EMERGENCY_URL} target="_blank" rel="noreferrer">Emergency information</a></div>
            </aside>
          </section>

          <FeedbackForm headingRef={feedbackHeadingRef} hidden={activeMoreSection !== "feedback"} />

          <section id="more-privacy" className="section page-width more-panel" aria-labelledby="more-privacy-title" hidden={activeMoreSection !== "privacy"}>
            <div className="section-heading compact-heading">
              <p className="section-label">Privacy</p>
              <h2 id="more-privacy-title" ref={privacyHeadingRef} tabIndex="-1">Tool entries stay on this page</h2>
              <p>The optional profile name stays in this browser on this device. First-Then, Choices, Timer and Communication entries are not saved or sent.</p>
            </div>
            <aside className="privacy-note" aria-labelledby="feedback-destination-title">
              <div>
                <p className="section-label">Where feedback goes</p>
                <h3 id="feedback-destination-title">Submitted feedback goes to APC</h3>
                <p>When you press Submit, your answers and optional comment go to APC’s feedback database on Cloudflare, together with the app version and date. They are not posted publicly or emailed automatically. APC does not ask for your name or email, and its feedback database does not store your IP address.</p>
              </div>
              <div className="privacy-links"><a href={PRIVACY_URL}>Read APC privacy information</a><a href={TERMS_URL}>Read APC terms</a></div>
            </aside>
          </section>

          <section id="more-evidence" className="section page-width more-panel evidence-section" aria-labelledby="more-evidence-title" hidden={activeMoreSection !== "evidence"}>
            <div className="section-heading compact-heading">
              <p className="section-label">Evidence</p>
              <h2 id="more-evidence-title" ref={evidenceHeadingRef} tabIndex="-1">Why these ideas are included</h2>
              <p>These sources support the general use of visual, communication and antecedent-based supports. They do not establish why a particular situation occurred or guarantee an outcome.</p>
            </div>
            <div className="evidence-grid">
              {evidenceNotes.map((item) => (
                <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Read the evidence brief: ${item.title}`}>Read the evidence brief</a></article>
              ))}
            </div>
          </section>

          <section id="more-install" className="section page-width more-panel" aria-labelledby="more-install-title" hidden={activeMoreSection !== "install"}>
            <div className="section-heading compact-heading">
              <p className="section-label">Install and support</p>
              <h2 id="more-install-title" ref={installHeadingRef} tabIndex="-1">Keep the companion easy to reach</h2>
            </div>
            <div className="more-install-grid">
              <article className="more-card install-card">
                <div><h3>Add to your Home Screen</h3><p>Calm Companion currently works as a web app. You do not need to download it from the App Store or Google Play. No account is needed, and anything you type into the tools is not saved.</p></div>
                {isInstalled
                  ? <p className="installed-state" role="status">Installed on this device</p>
                  : installPrompt && <button className="button primary" type="button" onClick={installApp}>Add to Home Screen now</button>}
                <button className="button secondary" type="button" onClick={openVisualInstallGuide}>See pictures</button>
                <p className="install-offline-note">After the app has loaded online once, its main tools may be reopened on this device without internet.</p>
              </article>
              <article className="more-card support-card">
                <div><h3>Need personalised support?</h3><p>If the same difficulties keep happening, general tips may not be enough. APC can look with you at routines, communication, surroundings and support needs. The app itself is not an assessment.</p></div>
                <a className="button secondary" href={`${APC_URL}start`} target="_blank" rel="noreferrer">View APC support</a>
              </article>
            </div>
          </section>
        </div>
      </main>

      <dialog
        ref={installDialogRef}
        className="install-dialog"
        aria-labelledby="visual-install-title"
        onClose={() => installDialogTriggerRef.current?.focus()}
      >
        <div className="install-dialog-shell">
          <div className="install-dialog-heading">
            <h2 id="visual-install-title" ref={installDialogHeadingRef} tabIndex="-1">Add to Home Screen</h2>
            <button className="dialog-close" type="button" onClick={closeVisualInstallGuide} aria-label="Close visual instructions">×</button>
          </div>

          <div className="platform-switch" aria-label="Choose phone type">
            {Object.entries(installGuides).map(([id, guide]) => (
              <button
                key={id}
                type="button"
                aria-pressed={installPlatform === id}
                onClick={() => setInstallPlatform(id)}
              >
                <img src={guide.icon} alt="" aria-hidden="true" />
                <span>{guide.label}</span>
              </button>
            ))}
          </div>

          <section className="visual-install-guide" aria-label={`${installGuides[installPlatform].label} Home Screen instructions`}>
            <ol className="visual-step-list">
              {installGuides[installPlatform].steps.map((step, index) => (
                <li key={step.label}>
                  <div className="step-number" aria-hidden="true">{index + 1}</div>
                  <div className="step-visual" aria-hidden="true">
                    <img className={`step-image step-image-${step.kind}`} src={step.image} alt="" />
                  </div>
                  <strong className="step-label">{step.label}</strong>
                </li>
              ))}
            </ol>
          </section>

          <div className="install-dialog-footer">
            <button className="button primary" type="button" onClick={closeVisualInstallGuide}>Done</button>
          </div>
        </div>
      </dialog>

      <footer className="site-footer">
        <div className="page-width footer-grid">
          <div><strong>APC Calm Companion</strong><p>General educational parent support from Autism Pathways Consulting.</p></div>
          <div className="footer-links"><button type="button" onClick={openFeedback}>Send feedback</button><a href={APC_URL}>APC website</a><a href={PRIVACY_URL}>Privacy</a><a href={TERMS_URL}>Terms</a><a href={BEFRIENDERS_URL} target="_blank" rel="noreferrer">Befrienders KL</a></div>
          <p className="footer-boundary">Not therapy, diagnosis, assessment, medical advice or emergency support. No outcome is guaranteed.</p>
        </div>
      </footer>
    </div>
  );
}
