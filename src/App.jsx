import { useEffect, useRef, useState } from "react";
import "./App.modern.css";
import APC_LOGO from "./assets/apc-logo.png";
import FeedbackForm from "./FeedbackForm.jsx";
import { communicationOptions, evidenceNotes, formatTime, guideOptions, normaliseMinutes, parentPause } from "./content.js";

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
];

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

export default function App() {
  const [activeView, setActiveView] = useState("actions");
  const [activeGuide, setActiveGuide] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [firstStep, setFirstStep] = useState("Shoes on");
  const [thenStep, setThenStep] = useState("Go to the car");
  const [choiceA, setChoiceA] = useState("Blue shirt");
  const [choiceB, setChoiceB] = useState("Green shirt");
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedPhrase, setSelectedPhrase] = useState("Choose a communication option");
  const [voiceOn, setVoiceOn] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const viewHeadingRef = useRef(null);
  const guidePanelRef = useRef(null);
  const toolPanelRef = useRef(null);
  const feedbackHeadingRef = useRef(null);
  const shouldMoveFocusRef = useRef(false);
  const shouldFocusToolRef = useRef(false);
  const shouldFocusFeedbackRef = useRef(false);
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

  useEffect(() => {
    if (!shouldMoveFocusRef.current) return;
    shouldMoveFocusRef.current = false;
    if (activeView === "actions" && activeGuide) guidePanelRef.current?.focus();
    else viewHeadingRef.current?.focus();
  }, [activeGuide, activeTool, activeView]);

  useEffect(() => {
    if (!shouldFocusToolRef.current || activeView !== "tools" || !activeTool) return;
    shouldFocusToolRef.current = false;
    toolPanelRef.current?.focus();
  }, [activeTool, activeView]);

  useEffect(() => {
    if (!shouldFocusFeedbackRef.current || activeView !== "about") return;
    shouldFocusFeedbackRef.current = false;
    window.requestAnimationFrame(() => {
      feedbackHeadingRef.current?.focus();
      feedbackHeadingRef.current?.scrollIntoView({ block: "start" });
    });
  }, [activeView]);

  function chooseGuide(guide) {
    shouldMoveFocusRef.current = true;
    setActiveGuide(guide);
  }

  function openView(view) {
    shouldMoveFocusRef.current = true;
    setActiveView(view);
    if (view === "actions") setActiveGuide(null);
    if (view === "tools") setActiveTool(null);
    window.scrollTo({ top: 0 });
  }

  function openRelatedTool(tool) {
    shouldFocusToolRef.current = true;
    setActiveTool(tool);
    setActiveView("tools");
    window.scrollTo({ top: 0 });
  }

  function openTool(tool) {
    shouldFocusToolRef.current = true;
    setActiveTool(tool);
  }

  function returnToTools() {
    shouldMoveFocusRef.current = true;
    setActiveTool(null);
  }

  function openFeedback() {
    if (activeView === "about") {
      window.requestAnimationFrame(() => {
        feedbackHeadingRef.current?.focus();
        feedbackHeadingRef.current?.scrollIntoView({ block: "start" });
      });
      return;
    }
    shouldFocusFeedbackRef.current = true;
    setActiveView("about");
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
            Immediate danger or serious injury: <a className="safety-call" href="tel:999">call 999 in Malaysia</a>.
          </div>
          <button className="safety-detail" type="button" onClick={() => openView("about")}>Safety information</button>
        </div>
      </aside>

      <header className="site-header">
        <div className="page-width header-inner">
          <button className="brand" type="button" onClick={() => openView("actions")} aria-label="Open Calm Companion actions">
            <img src={APC_LOGO} alt="" />
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
          <div className="section-heading">
            <h1 id="choose-title" ref={!activeGuide ? viewHeadingRef : undefined} tabIndex="-1">What would help right now?</h1>
            <p>Choose the closest match. You do not need to work out the cause first.</p>
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
            </>
          ) : (
            <article ref={guidePanelRef} className="guide-panel focused-guide" tabIndex="-1" aria-live="polite" aria-labelledby="guide-panel-title">
              <button type="button" className="back-button" onClick={() => { shouldMoveFocusRef.current = true; setActiveGuide(null); }}>← All actions</button>
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
              <h1 id="tools-title" ref={viewHeadingRef} tabIndex="-1">Choose a visual tool</h1>
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
                  <div className="tool-intro"><h2>Two manageable choices</h2><p>Offer only options that are genuinely available. A point, reach, look, gesture or spoken response can all communicate a choice.</p></div>
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
                  <div className="tool-intro"><h2>Visual timer</h2><p>Use a timer only when knowing the remaining time is likely to help. Explain what will happen when it ends.</p></div>
                  <label className="minutes-field">Minutes<input type="number" min="1" max="60" inputMode="numeric" value={minutes} onChange={(event) => updateMinutes(event.target.value)} /></label>
                  <div className="timer-display" role="timer" aria-label={`${formatTime(remaining)} remaining`}>
                    <div className="timer-track" aria-hidden="true"><span style={{ width: `${timerProgress}%` }} /></div>
                    <strong>{formatTime(remaining)}</strong><span>remaining</span>
                  </div>
                  <p className="sr-only" aria-live="polite">{remaining === 0 ? "Timer finished." : ""}</p>
                  <div className="button-row">
                    <button className="button primary" type="button" onClick={() => setTimerRunning((value) => !value)} disabled={remaining === 0}>{timerRunning ? "Pause" : "Start"}</button>
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

            </div>
            </>)}
          </div>
        </section>}

        {activeView === "about" && <div className="about-view">
        <section id="about" className="section page-width view-section" aria-labelledby="about-title">
          <div className="section-heading">
            <h1 id="about-title" ref={viewHeadingRef} tabIndex="-1">Safety, privacy and feedback</h1>
            <p className="working-boundary">This is general educational support for everyday situations. It is not therapy, diagnosis, assessment, medical advice or crisis support.</p>
          </div>
          <aside className="emergency-card" aria-labelledby="emergency-card-title">
            <h2 id="emergency-card-title">When not to use this app</h2>
            <p>If anyone is in immediate danger, seriously injured, unable to breathe, at risk of running into danger, or you cannot keep people safe, call 999 in Malaysia or your local emergency service.</p>
            <div className="button-row"><a className="button emergency" href="tel:999">Call 999</a><a className="button secondary" href={EMERGENCY_URL} target="_blank" rel="noreferrer">Emergency information</a></div>
          </aside>
        </section>

        <FeedbackForm headingRef={feedbackHeadingRef} />

        <section className="section page-width evidence-section" aria-labelledby="evidence-title">
          <div className="section-heading compact-heading">
            <p className="section-label">Evidence and privacy</p>
            <h2 id="evidence-title">Why these ideas are included</h2>
            <p>These sources support the general use of visual, communication and antecedent-based supports. They do not establish why a particular situation occurred or guarantee an outcome.</p>
          </div>
          <div className="evidence-grid">
            {evidenceNotes.map((item) => (
              <article key={item.title}><h3>{item.title}</h3><p>{item.summary}</p><a href={item.url} target="_blank" rel="noreferrer">Read the evidence brief</a></article>
            ))}
          </div>
          <aside className="privacy-note" aria-labelledby="privacy-note-title">
            <div>
              <p className="section-label">App privacy</p>
              <h2 id="privacy-note-title">Tool entries stay on this page</h2>
              <p>First-Then, Choices, Timer and Communication entries are not saved or sent. Feedback is sent only when you choose Submit. APC receives your selected answers, optional comment, app version and submission date. APC does not request a name or email and does not store IP addresses in its feedback database.</p>
            </div>
            <div className="privacy-links"><a href={PRIVACY_URL}>Read APC privacy information</a><a href={TERMS_URL}>Read APC terms</a></div>
          </aside>
        </section>

        <section className="section install-section" aria-labelledby="install-title">
          <div className="page-width install-card">
            <div><p className="section-label">Optional</p><h2 id="install-title">Keep the companion on your device</h2><p>The app can be installed from a supported browser. It does not require an account or save information entered into the tools. After one complete online visit, the core app can be reopened without a connection on the same device.</p></div>
            <button className="button primary" type="button" onClick={installApp}>Install or show instructions</button>
            {showInstallSteps && (
              <div className="install-steps" role="status"><p><strong>iPhone or iPad:</strong> open in Safari, tap Share, then Add to Home Screen.</p><p><strong>Android or desktop:</strong> open the browser menu and choose Install app or Add to Home screen.</p></div>
            )}
          </div>
        </section>

        <section className="section page-width support-section" aria-labelledby="support-title">
          <div><p className="section-label">Need personalised support?</p><h2 id="support-title">Repeated difficulties may need a closer individual review</h2><p>APC can help parents examine routines, communication, environment and support needs without treating the app as an assessment.</p></div>
          <a className="button primary" href={`${APC_URL}start`} target="_blank" rel="noreferrer">View APC support</a>
        </section>
        </div>}
      </main>

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
