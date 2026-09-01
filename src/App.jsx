import { useEffect, useRef, useState } from "react";
import "./App.css";
import APC_LOGO from "./assets/apc-logo.png";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes } from "./content.js";

const APC_URL = "https://autismpathwaysconsulting.com/";
const PRIVACY_URL = "https://autismpathwaysconsulting.com/privacy";
const TERMS_URL = "https://autismpathwaysconsulting.com/terms";
const EMERGENCY_URL = "https://www.malaysia.gov.my/en/categories/safety-and-community/public-safety/mers-999-emergency-line";
const BEFRIENDERS_URL = "https://befrienders.org.my/contact-us/";

function ToolButton({ active, children, onClick, controls }) {
  return (
    <button type="button" className="tool-tab" aria-pressed={active} aria-controls={controls} onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState("actions");
  const [activeGuide, setActiveGuide] = useState(null);
  const [activeTool, setActiveTool] = useState("first-then");
  const [firstStep, setFirstStep] = useState("Shoes on");
  const [thenStep, setThenStep] = useState("Go to the car");
  const [choiceA, setChoiceA] = useState("Blue shirt");
  const [choiceB, setChoiceB] = useState("Green shirt");
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("Choose a communication option");
  const [voiceOn, setVoiceOn] = useState(false);
  const [observation, setObservation] = useState({ before: "", tried: "", changed: "" });
  const [copyStatus, setCopyStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const viewHeadingRef = useRef(null);
  const guidePanelRef = useRef(null);
  const speechAvailable = "speechSynthesis" in window;

  useEffect(() => {
    if (!timerRunning) return undefined;
    const timerId = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [timerRunning]);

  useEffect(() => {
    function captureInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
  }, []);

  function chooseGuide(guide) {
    setActiveGuide(guide);
    window.requestAnimationFrame(() => guidePanelRef.current?.focus());
  }

  function openView(view) {
    setActiveView(view);
    if (view === "actions") setActiveGuide(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => viewHeadingRef.current?.focus());
  }

  function openRelatedTool(tool) {
    setActiveTool(tool);
    setActiveView("tools");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => viewHeadingRef.current?.focus());
  }

  function updateMinutes(value) {
    const nextMinutes = normaliseMinutes(value);
    setMinutes(nextMinutes);
    setRemaining(nextMinutes * 60);
    setTimerRunning(false);
  }

  function resetTimer() {
    setTimerRunning(false);
    setRemaining(minutes * 60);
  }

  function selectCommunicationOption(option) {
    setSelectedPhrase(option.phrase);
    if (!voiceOn || !speechAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(option.phrase);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }

  async function copyObservation() {
    const text = [
      "APC Calm Companion observation",
      `Before: ${observation.before || "Not recorded"}`,
      `Action tried: ${observation.tried || "Not recorded"}`,
      `What became easier or remained difficult: ${observation.changed || "Not recorded"}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied. Paste it somewhere private if you want to keep it.");
    } catch {
      setCopyStatus("Copying is unavailable in this browser. You can select the text manually.");
    }
  }

  async function installApp() {
    if (!installPrompt) {
      setShowInstallSteps(true);
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const timerProgress = Math.max(0, Math.min(100, (remaining / (minutes * 60)) * 100));

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <aside className="safety-bar" aria-labelledby="safety-title">
        <div className="page-width safety-inner">
          <div>
            <strong id="safety-title">Not for emergencies.</strong>{" "}
            Immediate danger or serious injury: call 999 in Malaysia or your local emergency service.
          </div>
          <a className="safety-detail" href={EMERGENCY_URL} target="_blank" rel="noreferrer">Emergency information</a>
        </div>
      </aside>

      <header className="site-header">
        <div className="page-width header-inner">
          <button className="brand" type="button" onClick={() => openView("actions")} aria-label="Open Calm Companion actions">
            <img src={APC_LOGO} alt="" />
            <span><strong>APC Calm Companion</strong><small>Autism Pathways Consulting</small></span>
          </button>
          <nav className="app-nav" aria-label="Main navigation">
            <button type="button" aria-current={activeView === "actions" ? "page" : undefined} onClick={() => openView("actions")}>Actions</button>
            <button type="button" aria-current={activeView === "tools" ? "page" : undefined} onClick={() => openView("tools")}>Tools</button>
            <button type="button" aria-current={activeView === "about" ? "page" : undefined} onClick={() => openView("about")}>About &amp; Safety</button>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex="-1">
        {activeView === "actions" && <section id="choose" className="section page-width view-section" aria-labelledby="choose-title">
          <div className="section-heading">
            <p className="eyebrow">Start here</p>
            <h1 id="choose-title" ref={!activeGuide ? viewHeadingRef : undefined} tabIndex="-1">What would help right now?</h1>
            <p>Choose what you can observe. You do not need to decide the cause first.</p>
          </div>
          {!activeGuide ? (
            <div className="guide-grid" aria-label="Parent action choices">
              {guideOptions.map((guide) => (
                <button type="button" key={guide.id} className="guide-choice" onClick={() => chooseGuide(guide)}>
                  <span className="guide-number" aria-hidden="true">{guide.number}</span>
                  <span><strong>{guide.label}</strong><small>{guide.short}</small></span>
                </button>
              ))}
            </div>
          ) : (
            <article ref={guidePanelRef} className="guide-panel focused-guide" tabIndex="-1" aria-live="polite" aria-labelledby="guide-panel-title">
              <button type="button" className="back-button" onClick={() => { setActiveGuide(null); window.requestAnimationFrame(() => viewHeadingRef.current?.focus()); }}>← All actions</button>
              <p className="guide-kicker">Try one action</p>
              <h3 id="guide-panel-title">{activeGuide.title}</h3>
              <ol>{activeGuide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
              <div className="say-box"><span>You could say</span><strong>“{activeGuide.say}”</strong></div>
              <p className="notice-line"><strong>Notice:</strong> {activeGuide.notice}</p>
              {activeGuide.tool && (
                <button type="button" className="text-button" onClick={() => openRelatedTool(activeGuide.tool)}>
                  Open the related visual tool
                </button>
              )}
            </article>
          )}
        </section>}

        {activeView === "tools" && <section id="tools" className="section tools-section view-section" aria-labelledby="tools-title">
          <div className="page-width">
            <div className="section-heading">
              <p className="eyebrow">Optional visual tools</p>
              <h1 id="tools-title" ref={viewHeadingRef} tabIndex="-1">Choose one visual tool</h1>
              <p>These tools support understanding and communication. They do not require a child to respond in a particular way.</p>
            </div>
            <div className="tool-tabs" role="group" aria-label="Choose a visual tool">
              <ToolButton active={activeTool === "first-then"} controls="first-then-panel" onClick={() => setActiveTool("first-then")}>First, then</ToolButton>
              <ToolButton active={activeTool === "choices"} controls="choices-panel" onClick={() => setActiveTool("choices")}>Two choices</ToolButton>
              <ToolButton active={activeTool === "timer"} controls="timer-panel" onClick={() => setActiveTool("timer")}>Timer</ToolButton>
              <ToolButton active={activeTool === "communication"} controls="communication-panel" onClick={() => setActiveTool("communication")}>Communication</ToolButton>
              <ToolButton active={activeTool === "observe"} controls="observe-panel" onClick={() => setActiveTool("observe")}>Observe</ToolButton>
            </div>

            <div className="tool-panel">
              {activeTool === "first-then" && (
                <div id="first-then-panel" className="tool-content">
                  <div className="tool-intro"><h3>First, then</h3><p>Use two short, concrete steps. “Then” should be accurate and realistically available.</p></div>
                  <div className="field-grid">
                    <label>First<input value={firstStep} maxLength="40" onChange={(event) => setFirstStep(event.target.value)} /></label>
                    <label>Then<input value={thenStep} maxLength="40" onChange={(event) => setThenStep(event.target.value)} /></label>
                  </div>
                  <div className="visual-board two-part" aria-label={`First ${firstStep || "blank"}, then ${thenStep || "blank"}`}>
                    <div><span>First</span><strong>{firstStep || "Add one step"}</strong></div>
                    <div><span>Then</span><strong>{thenStep || "Add what follows"}</strong></div>
                  </div>
                </div>
              )}

              {activeTool === "choices" && (
                <div id="choices-panel" className="tool-content">
                  <div className="tool-intro"><h3>Two manageable choices</h3><p>Offer only options that are genuinely available. A point, reach, look, gesture or spoken response can all communicate a choice.</p></div>
                  <div className="field-grid">
                    <label>Choice one<input value={choiceA} maxLength="40" onChange={(event) => setChoiceA(event.target.value)} /></label>
                    <label>Choice two<input value={choiceB} maxLength="40" onChange={(event) => setChoiceB(event.target.value)} /></label>
                  </div>
                  <div className="visual-board two-part choices" aria-label={`Choice one ${choiceA || "blank"}, choice two ${choiceB || "blank"}`}>
                    <div><span>Choice 1</span><strong>{choiceA || "Add a choice"}</strong></div>
                    <div><span>Choice 2</span><strong>{choiceB || "Add a choice"}</strong></div>
                  </div>
                </div>
              )}

              {activeTool === "timer" && (
                <div id="timer-panel" className="tool-content timer-content">
                  <div className="tool-intro"><h3>Visual timer</h3><p>Use a timer only when knowing the remaining time is likely to help. Explain what will happen when it ends.</p></div>
                  <label className="minutes-field">Minutes<input type="number" min="1" max="60" inputMode="numeric" value={minutes} onChange={(event) => updateMinutes(event.target.value)} /></label>
                  <div className="timer-display" role="timer" aria-label={`${formatTime(remaining)} remaining`}>
                    <div className="timer-track" aria-hidden="true"><span style={{ width: `${timerProgress}%` }} /></div>
                    <strong>{formatTime(remaining)}</strong><span>remaining</span>
                  </div>
                  <div className="button-row">
                    <button className="button primary" type="button" onClick={() => setTimerRunning((value) => !value)} disabled={remaining === 0}>{timerRunning ? "Pause" : "Start"}</button>
                    <button className="button secondary" type="button" onClick={resetTimer}>Reset</button>
                  </div>
                </div>
              )}

              {activeTool === "communication" && (
                <div id="communication-panel" className="tool-content">
                  <div className="tool-intro split-heading">
                    <div><h3>Simple communication options</h3><p>Model or show a response without requiring speech. Keep the child’s existing communication system available.</p></div>
                    <label className="toggle-label"><input type="checkbox" checked={voiceOn} disabled={!speechAvailable} onChange={(event) => setVoiceOn(event.target.checked)} /> Speak selected words</label>
                  </div>
                  <p className="selected-phrase" aria-live="polite">{selectedPhrase}</p>
                  {!speechAvailable && <p className="voice-note">Spoken playback is not available in this browser. The communication buttons still show the selected words.</p>}
                  <div className="communication-grid">
                    {communicationOptions.map((option) => (
                      <button type="button" key={option.label} onClick={() => selectCommunicationOption(option)}>
                        <span aria-hidden="true">{option.icon}</span><strong>{option.label}</strong><small>{option.phrase}</small>
                      </button>
                    ))}
                  </div>
                  <p className="medical-note">Pain, illness, breathing difficulty, injury or a sudden concerning change may need medical assessment. Do not use the board to delay urgent care.</p>
                </div>
              )}

              {activeTool === "observe" && (
                <div id="observe-panel" className="tool-content">
                  <div className="tool-intro"><h3>Notice what changed</h3><p>Describe what you observed without diagnosing the cause. Nothing typed here is saved or sent by this app. It clears when the page refreshes.</p></div>
                  <div className="observation-grid">
                    <label>What happened just before?<textarea value={observation.before} onChange={(event) => setObservation({ ...observation, before: event.target.value })} /></label>
                    <label>What one action did you try?<textarea value={observation.tried} onChange={(event) => setObservation({ ...observation, tried: event.target.value })} /></label>
                    <label>What became easier or remained difficult?<textarea value={observation.changed} onChange={(event) => setObservation({ ...observation, changed: event.target.value })} /></label>
                  </div>
                  <div className="button-row">
                    <button className="button primary" type="button" onClick={copyObservation}>Copy observation</button>
                    <button className="button secondary" type="button" onClick={() => { setObservation({ before: "", tried: "", changed: "" }); setCopyStatus(""); }}>Clear</button>
                  </div>
                  <p className="status-message" role="status">{copyStatus}</p>
                </div>
              )}
            </div>
          </div>
        </section>}

        {activeView === "about" && <div className="about-view">
        <section id="about" className="section page-width view-section" aria-labelledby="about-title">
          <div className="section-heading">
            <p className="eyebrow">Evidence and boundaries</p>
            <h1 id="about-title" ref={viewHeadingRef} tabIndex="-1">About and safety</h1>
            <p className="working-boundary">This is general educational support for everyday situations. It is not therapy, diagnosis, assessment, medical advice or crisis support.</p>
            <p>These sources support the general use of visual, communication and antecedent-based supports. They do not establish why a particular situation occurred or guarantee an outcome.</p>
          </div>
          <aside className="emergency-card" aria-labelledby="emergency-card-title">
            <h2 id="emergency-card-title">When not to use this app</h2>
            <p>If anyone is in immediate danger, seriously injured, unable to breathe, at risk of running into danger, or you cannot keep people safe, call 999 in Malaysia or your local emergency service.</p>
            <div className="button-row"><a className="button emergency" href="tel:999">Call 999</a><a className="button secondary" href={EMERGENCY_URL} target="_blank" rel="noreferrer">Emergency information</a></div>
          </aside>
          <div className="evidence-grid">
            {evidenceNotes.map((item) => (
              <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p><a href={item.url} target="_blank" rel="noreferrer">Read the evidence brief</a></article>
            ))}
          </div>
          <aside className="privacy-note" aria-labelledby="privacy-note-title">
            <div>
              <p className="eyebrow">App privacy</p>
              <h3 id="privacy-note-title">Nothing entered in these tools is saved or sent by the app</h3>
              <p>There is no account, analytics or advertising tracker. Entries stay in the current page and clear when it is refreshed or closed. Avoid entering identifying or sensitive child information on a shared device.</p>
            </div>
            <div className="privacy-links"><a href={PRIVACY_URL}>Read APC privacy information</a><a href={TERMS_URL}>Read APC terms</a></div>
          </aside>
        </section>

        <section className="section install-section" aria-labelledby="install-title">
          <div className="page-width install-card">
            <div><p className="eyebrow">Optional</p><h2 id="install-title">Keep the companion on your device</h2><p>The app can be installed from a supported browser. It does not require an account or save information entered into the tools. After one complete online visit, the core app can be reopened without a connection on the same device.</p></div>
            <button className="button primary" type="button" onClick={installApp}>Install or show instructions</button>
            {showInstallSteps && (
              <div className="install-steps" role="status"><p><strong>iPhone or iPad:</strong> open in Safari, tap Share, then Add to Home Screen.</p><p><strong>Android or desktop:</strong> open the browser menu and choose Install app or Add to Home screen.</p></div>
            )}
          </div>
        </section>

        <section className="section page-width support-section" aria-labelledby="support-title">
          <div><p className="eyebrow">Need personalised support?</p><h2 id="support-title">Repeated difficulties may need a closer individual review</h2><p>APC can help parents examine routines, communication, environment and support needs without treating the app as an assessment.</p></div>
          <a className="button primary" href={`${APC_URL}start`} target="_blank" rel="noreferrer">View APC support</a>
        </section>
        </div>}
      </main>

      <footer className="site-footer">
        <div className="page-width footer-grid">
          <div><strong>APC Calm Companion</strong><p>General educational parent support from Autism Pathways Consulting.</p></div>
          <div className="footer-links"><a href={APC_URL}>APC website</a><a href={PRIVACY_URL}>Privacy</a><a href={TERMS_URL}>Terms</a><a href={BEFRIENDERS_URL} target="_blank" rel="noreferrer">Befrienders KL</a></div>
          <p className="footer-boundary">Not therapy, diagnosis, assessment, medical advice or emergency support. No outcome is guaranteed.</p>
        </div>
      </footer>
    </div>
  );
}
