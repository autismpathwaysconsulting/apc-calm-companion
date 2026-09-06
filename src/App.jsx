import { useEffect, useRef, useState } from "react";
import "./App.modern.css";
import FeedbackForm from "./FeedbackForm.jsx";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes, parentPause, secondsUntilDeadline } from "./content.js";

const APC_URL = "https://autismpathwaysconsulting.com/";
const PRIVACY_URL = "https://autismpathwaysconsulting.com/privacy";
const TERMS_URL = "https://autismpathwaysconsulting.com/terms";
const EMERGENCY_URL = "https://www.malaysia.gov.my/en/categories/safety-and-community/public-safety/mers-999-emergency-line";
const BEFRIENDERS_URL = "https://befrienders.org.my/contact-us/";

const guideVisuals = {
  "less-language": "💬",
  "next-step": "1️⃣",
  respond: "🙋",
  situation: "👀",
  "parent-pause": "🌿",
};

const toolOptions = [
  { id: "first-then", label: "First / Then", icon: "1️⃣" },
  { id: "choices", label: "Two choices", icon: "↔️" },
  { id: "timer", label: "Timer", icon: "⏱️" },
  { id: "calm", label: "Calm breathing", icon: "🌬️" },
  { id: "communication", label: "Communication", icon: "💬" },
  { id: "observation", label: "Quick check", icon: "👀" },
];

const routineTemplates = {
  "Morning routine": [
    ["🌤️", "Wake up"], ["🚽", "Toilet"], ["🪥", "Brush teeth"], ["🥣", "Breakfast"], ["🎒", "Pack bag"],
  ],
  "After school": [
    ["🍎", "Snack"], ["🛋️", "Rest"], ["✏️", "Homework"], ["⚽", "Play"],
  ],
  Bedtime: [
    ["🛁", "Bath"], ["👕", "Pyjamas"], ["📖", "Story"], ["🌙", "Sleep"],
  ],
  "Community outing": [
    ["🗺️", "Look at plan"], ["🎧", "Bring support item"], ["🚶", "Go together"], ["🪪", "Ask for a break"],
  ],
};

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

function makeRoutine(name) {
  return routineTemplates[name].map(([icon, title], index) => ({ id: `${name}-${index}`, icon, title, done: false }));
}

function guideVisual(guide) {
  return guideVisuals[guide.id];
}

function isRunningInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function defaultInstallPlatform() {
  return /Android/i.test(window.navigator.userAgent) ? "android" : "apple";
}

export default function App() {
  const allGuides = [...guideOptions, parentPause];
  const [activeGuide, setActiveGuide] = useState(guideOptions[0]);
  const [activeTool, setActiveTool] = useState("calm");
  const [firstStep, setFirstStep] = useState("");
  const [thenStep, setThenStep] = useState("");
  const [choiceA, setChoiceA] = useState("");
  const [choiceB, setChoiceB] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("Tap a card");
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("ready");
  const [breathingCount, setBreathingCount] = useState(4);
  const [routineName, setRoutineName] = useState("Morning routine");
  const [routine, setRoutine] = useState(() => makeRoutine("Morning routine"));
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(isRunningInstalled);
  const [installPlatform, setInstallPlatform] = useState(defaultInstallPlatform);
  const timerDeadlineRef = useRef(null);
  const feedbackHeadingRef = useRef(null);
  const installDialogRef = useRef(null);
  const installDialogHeadingRef = useRef(null);
  const installDialogTriggerRef = useRef(null);
  const speechAvailable = "speechSynthesis" in window;

  useEffect(() => {
    if (!timerRunning) return undefined;
    function updateTimer() {
      const nextRemaining = secondsUntilDeadline(timerDeadlineRef.current);
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
    if (!breathingActive) return undefined;
    let phase = "inhale";
    let count = 4;
    const interval = window.setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (phase === "inhale") { phase = "hold"; count = 2; }
        else if (phase === "hold") { phase = "exhale"; count = 6; }
        else { phase = "inhale"; count = 4; }
      }
      setBreathingPhase(phase);
      setBreathingCount(count);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [breathingActive]);

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

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function chooseGuide(guide) {
    setActiveGuide(guide);
    window.requestAnimationFrame(() => goTo("recommendation-panel"));
  }

  function chooseTool(id) {
    setActiveTool(id);
    window.requestAnimationFrame(() => goTo("active-tool-view"));
  }

  function updateMinutes(value) {
    const next = normaliseMinutes(value);
    timerDeadlineRef.current = null;
    setMinutes(next);
    setRemaining(next * 60);
    setTimerRunning(false);
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

  function resetTimer() {
    timerDeadlineRef.current = null;
    setTimerRunning(false);
    setRemaining(minutes * 60);
  }

  function selectPhrase(option) {
    setSelectedPhrase(option.phrase);
    if (!voiceOn || !speechAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(option.phrase);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  function toggleBreathing() {
    if (breathingActive) {
      setBreathingActive(false);
      setBreathingPhase("ready");
      setBreathingCount(4);
      return;
    }
    setBreathingPhase("inhale");
    setBreathingCount(4);
    setBreathingActive(true);
  }

  function resetBreathing() {
    setBreathingActive(false);
    setBreathingPhase("ready");
    setBreathingCount(4);
  }

  function changeRoutine(name) {
    setRoutineName(name);
    setRoutine(makeRoutine(name));
  }

  function toggleRoutineStep(id) {
    setRoutine((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
  }

  function openFeedback() {
    setFeedbackOpen(true);
    window.requestAnimationFrame(() => {
      feedbackHeadingRef.current?.focus();
      goTo("feedback");
    });
  }

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  function openVisualInstallGuide(event) {
    installDialogTriggerRef.current = event.currentTarget;
    installDialogRef.current?.showModal();
    window.requestAnimationFrame(() => installDialogHeadingRef.current?.focus());
  }

  const timerProgress = Math.max(0, Math.min(100, remaining / (minutes * 60) * 100));
  const phaseLabel = breathingPhase === "inhale" ? "Breathe in" : breathingPhase === "hold" ? "Hold" : breathingPhase === "exhale" ? "Breathe out" : "Ready";

  return (
    <div className="legacy-app">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="safety-bar" aria-labelledby="safety-title">
        <div className="legacy-width safety-inner"><div><strong id="safety-title">Not for emergencies.</strong> Immediate danger or serious injury: <a className="safety-call" href="tel:999">call 999 in Malaysia</a>.</div><button className="safety-detail" type="button" onClick={() => goTo("safety")}>Safety information</button></div>
      </aside>

      <main id="main-content" className="legacy-width" tabIndex="-1">
        <header className="legacy-hero">
          <div className="legacy-brand-line"><img src="/icon-192.png" alt="" /><span>Autism Pathways Consulting</span></div>
          <div className="legacy-hero-copy"><img className="legacy-logo" src="/icon-512.png" alt="Autism Pathways Consulting logo" /><div><h1>APC Calm Companion</h1><p>One visual step for the moment you are in.</p></div></div>
          <nav className="legacy-jump-grid" aria-label="Jump to a support area">
            <button type="button" onClick={() => goTo("calm-reset")}>🌿 <span>Calm support</span></button><button type="button" onClick={() => goTo("quick-tools")}>🧰 <span>Visual tools</span></button><button type="button" onClick={() => goTo("routine")}>✅ <span>Routine</span></button><button type="button" onClick={() => goTo("communication")}>💬 <span>Communication</span></button><button type="button" onClick={openVisualInstallGuide}>📲 <span>Install</span></button>
          </nav>
        </header>

        <section id="calm-reset" className="legacy-card calm-reset-section" aria-labelledby="calm-reset-title">
          <div className="legacy-section-heading"><span className="legacy-kicker">APC Calm Reset</span><h2 id="calm-reset-title">What might help right now?</h2></div>
          <div className="calm-reset-grid">
            <div className="scenario-grid" aria-label="Choose the closest situation">{allGuides.map((guide) => <button key={guide.id} type="button" aria-pressed={activeGuide === guide} onClick={() => chooseGuide(guide)}><span aria-hidden="true">{guideVisual(guide)}</span><strong>{guide.label}</strong></button>)}</div>
            <article id="recommendation-panel" className="recommendation-panel" aria-live="polite">
              <div className="recommendation-title"><span aria-hidden="true">{guideVisual(activeGuide)}</span><div><small>One option to try</small><h3>{activeGuide.title}</h3></div></div>
              <div className="try-now"><small>Try this now</small><strong>{activeGuide.now}</strong></div><div className="say-this"><small>You could say</small><strong>“{activeGuide.say}”</strong></div>
              {activeGuide.tools?.length > 0 && <div className="recommendation-tools">{activeGuide.tools.map((id) => <button type="button" key={id} onClick={() => chooseTool(id)}>Open {toolOptions.find((tool) => tool.id === id)?.label}</button>)}</div>}
              <details><summary>More guidance</summary><ol>{activeGuide.steps.map((step) => <li key={step}>{step}</li>)}</ol><p><strong>Notice:</strong> {activeGuide.notice}</p></details>
            </article>
          </div>
        </section>

        <section id="quick-tools" className="legacy-card" aria-labelledby="quick-tools-title">
          <div className="legacy-section-heading"><span className="legacy-kicker">Everyday support tools</span><h2 id="quick-tools-title">Choose a visual tool</h2></div>
          <div className="quick-tool-tabs" aria-label="Visual tools">{toolOptions.map((tool) => <button type="button" key={tool.id} aria-pressed={activeTool === tool.id} onClick={() => chooseTool(tool.id)}><span aria-hidden="true">{tool.icon}</span><strong>{tool.label}</strong></button>)}</div>
          <div id="active-tool-view" className="active-tool-view">
            {activeTool === "first-then" && <section aria-labelledby="first-then-title"><h3 id="first-then-title">First / Then Board</h3><div className="field-grid"><label>First<input value={firstStep} maxLength="40" placeholder="Shoes on" onChange={(event) => setFirstStep(event.target.value)} /></label><label>Then<input value={thenStep} maxLength="40" placeholder="Go to the car" onChange={(event) => setThenStep(event.target.value)} /></label></div><div className="visual-board two-part"><div><small>First</small><span aria-hidden="true">1️⃣</span><strong>{firstStep || "One step"}</strong></div><div><small>Then</small><span aria-hidden="true">➡️</span><strong>{thenStep || "What follows"}</strong></div></div></section>}
            {activeTool === "choices" && <section aria-labelledby="choices-title"><h3 id="choices-title">Two manageable choices</h3><div className="field-grid"><label>Choice one<input value={choiceA} maxLength="40" placeholder="Blue shirt" onChange={(event) => setChoiceA(event.target.value)} /></label><label>Choice two<input value={choiceB} maxLength="40" placeholder="Green shirt" onChange={(event) => setChoiceB(event.target.value)} /></label></div><div className="visual-board two-part choices"><div><small>Choice 1</small><span aria-hidden="true">🟦</span><strong>{choiceA || "One choice"}</strong></div><div><small>Choice 2</small><span aria-hidden="true">🟩</span><strong>{choiceB || "One choice"}</strong></div></div></section>}
            {activeTool === "timer" && <section className="timer-tool" aria-labelledby="timer-title"><h3 id="timer-title">Visual Timer</h3><label className="minutes-field">Minutes<input type="number" min="1" max="60" inputMode="numeric" value={minutes} onChange={(event) => updateMinutes(event.target.value)} /></label><div className="legacy-timer" role="timer" aria-label={`${formatTime(remaining)} remaining`} style={{ "--timer-progress": `${timerProgress * 3.6}deg` }}><div><strong>{formatTime(remaining)}</strong><span>remaining</span></div></div><p className="timer-note">This timer has no alarm or notification. Return to this screen to check it.</p><div className="button-row"><button className="button primary" type="button" onClick={toggleTimer} disabled={remaining === 0}>{timerRunning ? "Pause timer" : "Start timer"}</button><button className="button secondary" type="button" onClick={resetTimer}>Reset</button></div></section>}
            {activeTool === "calm" && <section className="breathing-tool" aria-labelledby="breathing-title"><h3 id="breathing-title">Automatic Calm Breathing</h3><p>Follow only if this feels comfortable. Ordinary breathing is enough.</p><div className={`breathing-stage phase-${breathingPhase}`}><div className="breathing-ring"></div><div className="breathing-core"><small>{phaseLabel}</small><strong>{breathingActive ? breathingCount : ""}</strong></div></div><div className="button-row"><button className="button primary" type="button" onClick={toggleBreathing}>{breathingActive ? "Stop" : "Start breathing guide"}</button><button className="button secondary" type="button" onClick={resetBreathing}>Reset</button></div><div className="breathing-steps" aria-label="Breathing sequence"><span className={breathingPhase === "inhale" ? "active" : ""}>🌬️ Breathe in 4</span><span className={breathingPhase === "hold" ? "active" : ""}>⏸️ Hold 2</span><span className={breathingPhase === "exhale" ? "active" : ""}>🍃 Breathe out 6</span></div></section>}
            {activeTool === "communication" && <section aria-labelledby="tool-communication-title"><h3 id="tool-communication-title">Quick communication board</h3><p className="selected-phrase" aria-live="polite">{selectedPhrase}</p><div className="button-row"><label className="toggle-label"><input type="checkbox" checked={voiceOn} disabled={!speechAvailable} onChange={(event) => setVoiceOn(event.target.checked)} /> Voice on</label></div><div className="communication-grid">{communicationOptions.map((option) => <button type="button" key={option.label} aria-pressed={selectedPhrase === option.phrase} onClick={() => selectPhrase(option)}><span aria-hidden="true">{option.icon}</span><strong>{option.label}</strong><small>{option.phrase}</small></button>)}</div><p className="medical-note">Pain, illness, breathing difficulty, injury or a sudden concerning change may need medical assessment. Do not use the board to delay urgent care.</p></section>}
            {activeTool === "observation" && <section aria-labelledby="observation-title"><h3 id="observation-title">Quick observation check</h3><div className="observation-grid"><article><span>1</span><h4>Safety and health</h4><p>Check for danger, breathing difficulty, injury, pain, illness or a sudden change.</p></article><article><span>2</span><h4>Communication</h4><p>Keep the person’s usual device, picture, object, sign or gesture available.</p></article><article><span>3</span><h4>Surroundings</h4><p>Notice noise, light, crowding, temperature, clothing and space.</p></article><article><span>4</span><h4>Task and timing</h4><p>Could one next step be shorter, clearer or easier to begin?</p></article></div><p className="observation-note">Change one reasonable factor, then notice what changes. This is observation, not assessment or proof of a cause.</p></section>}
          </div>
        </section>

        <section id="routine" className="legacy-card routine-section" aria-labelledby="routine-title"><div className="legacy-section-heading icon-heading"><span aria-hidden="true">✅</span><div><small>Visual routine</small><h2 id="routine-title">Show the routine, then tap</h2></div></div><select value={routineName} onChange={(event) => changeRoutine(event.target.value)} aria-label="Choose a routine">{Object.keys(routineTemplates).map((name) => <option key={name}>{name}</option>)}</select><div className="routine-list">{routine.map((item) => <button type="button" key={item.id} aria-pressed={item.done} onClick={() => toggleRoutineStep(item.id)}><span aria-hidden="true">{item.done ? "✅" : item.icon}</span><strong>{item.title}</strong></button>)}</div><p className="privacy-inline">Routine taps stay on this page and clear when it is refreshed.</p></section>

        <section id="communication" className="legacy-card communication-section" aria-labelledby="communication-title"><div className="legacy-section-heading icon-heading"><span aria-hidden="true">💬</span><div><small>Communication</small><h2 id="communication-title">Quick communication board</h2></div></div><p className="selected-phrase" aria-live="polite">{selectedPhrase}</p><div className="communication-grid large-board">{communicationOptions.map((option, index) => <button type="button" key={option.label} data-tone={index % 4} aria-pressed={selectedPhrase === option.phrase} onClick={() => selectPhrase(option)}><span aria-hidden="true">{option.icon}</span><strong>{option.label}</strong><small>{option.phrase}</small></button>)}</div></section>

        {!isInstalled && <section className="legacy-card install-card" aria-labelledby="install-title"><span className="install-card-icon" aria-hidden="true">📲</span><div><small>Keep it close</small><h2 id="install-title">Add to Home Screen</h2></div>{installPrompt && <button className="button primary" type="button" onClick={installApp}>Install now</button>}<button className="button secondary" type="button" onClick={openVisualInstallGuide}>See pictures</button><span className="sr-only">Add Calm Companion to your phone Home Screen. No App Store or Google Play download is needed.</span></section>}

        <section className="legacy-card research-card" aria-labelledby="research-title"><button type="button" onClick={() => setResearchOpen((value) => !value)} aria-expanded={researchOpen}><span aria-hidden="true">📚</span><span><small>Optional</small><strong id="research-title">Research notes</strong></span><span aria-hidden="true">{researchOpen ? "−" : "+"}</span></button>{researchOpen && <div className="evidence-grid">{evidenceNotes.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open source: ${item.title}`}>Open source</a></article>)}</div>}</section>

        <section id="safety" className="legacy-card safety-section" aria-labelledby="safety-section-title"><div><small>Safety</small><h2 id="safety-section-title">Know when to stop using the app</h2><p>It is not therapy, diagnosis, assessment, medical advice or crisis support.</p></div><div className="button-row"><a className="button emergency" href="tel:999">Call 999</a><a className="button secondary" href={EMERGENCY_URL} target="_blank" rel="noreferrer">Emergency information</a></div></section>

        {feedbackOpen ? <FeedbackForm headingRef={feedbackHeadingRef} hidden={false} /> : <section className="legacy-cta"><div><small>Your experience matters</small><h2>Help improve Calm Companion</h2></div><button className="button light" type="button" onClick={openFeedback}>Give app feedback</button><a className="button ghost" href={`${APC_URL}start`} target="_blank" rel="noreferrer">View parent support</a></section>}

        <footer className="legacy-footer"><strong>APC Calm Companion</strong><p>General educational parent support from Autism Pathways Consulting. No outcome is guaranteed.</p><nav><a href={APC_URL}>APC website</a><a href={PRIVACY_URL}>Privacy</a><a href={TERMS_URL}>Terms</a><a href={BEFRIENDERS_URL}>Befrienders KL</a></nav><p>Tool entries stay on this page. Feedback is submitted separately and is not monitored for urgent help.</p></footer>
      </main>

      {!feedbackOpen && <button className="floating-feedback" type="button" onClick={openFeedback}>♡ <span>Feedback</span></button>}

      <dialog ref={installDialogRef} className="install-dialog" aria-labelledby="visual-install-title" onClose={() => installDialogTriggerRef.current?.focus()}><div className="install-dialog-shell"><div className="install-dialog-heading"><h2 id="visual-install-title" ref={installDialogHeadingRef} tabIndex="-1">Add to Home Screen</h2><button className="dialog-close" type="button" onClick={() => installDialogRef.current?.close()} aria-label="Close visual instructions">×</button></div><div className="platform-switch" aria-label="Choose phone type">{Object.entries(installGuides).map(([id, guide]) => <button key={id} type="button" aria-pressed={installPlatform === id} onClick={() => setInstallPlatform(id)}><img src={guide.icon} alt="" /><span>{guide.label}</span></button>)}</div><section className="visual-install-guide" aria-label={`${installGuides[installPlatform].label} Home Screen instructions`}><ol className="visual-step-list">{installGuides[installPlatform].steps.map((step, index) => <li key={step.label}><span className="step-number">{index + 1}</span><span className="step-visual"><img className={`step-image step-image-${step.kind}`} src={step.image} alt="" /></span><strong className="step-label">{step.label}</strong></li>)}</ol></section><div className="install-dialog-footer"><button className="button primary" type="button" onClick={() => installDialogRef.current?.close()}>Done</button></div></div></dialog>
    </div>
  );
}
