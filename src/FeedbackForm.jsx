import { useEffect, useRef, useState } from "react";
import { turnstileSizeForWidth } from "./feedback-utils.js";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
const PRIVACY_URL = "https://autismpathwaysconsulting.com/privacy";
const REQUEST_TIMEOUT_MS = 12000;

const helpfulnessOptions = [
  { value: "yes", label: "Yes" },
  { value: "a-little", label: "A little" },
  { value: "not-yet", label: "Not yet" },
];

const improvementOptions = [
  { value: "wording", label: "Wording" },
  { value: "too-many-choices", label: "Too many choices" },
  { value: "could-not-find-tool", label: "Could not find a tool" },
  { value: "tool-did-not-work", label: "A tool did not work" },
  { value: "accessibility", label: "Accessibility" },
  { value: "something-else", label: "Something else" },
];

const emptyFeedback = { helpfulness: "", category: "", comment: "", website: "" };

export default function FeedbackForm({ headingRef, onClose, hidden = false }) {
  const [feedback, setFeedback] = useState(emptyFeedback);
  const [status, setStatus] = useState({ state: "idle", message: "", field: "" });
  const [reference, setReference] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [shouldLoadSecurity, setShouldLoadSecurity] = useState(false);
  const [securityAttempt, setSecurityAttempt] = useState(0);
  const [securityState, setSecurityState] = useState(TURNSTILE_SITE_KEY ? "loading" : "unavailable");
  const [turnstileToken, setTurnstileToken] = useState("");
  const sectionRef = useRef(null);
  const firstHelpfulnessRef = useRef(null);
  const turnstileContainerRef = useRef(null);
  const turnstileWidgetRef = useRef(null);
  const submitInFlightRef = useRef(false);

  useEffect(() => {
    if (hidden || !TURNSTILE_SITE_KEY || !sectionRef.current) return undefined;
    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setShouldLoadSecurity(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoadSecurity(true);
      observer.disconnect();
    }, { rootMargin: "300px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hidden]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !shouldLoadSecurity) return undefined;
    let cancelled = false;
    let failureTimer;

    function markSecurityError() {
      if (!cancelled) setSecurityState("error");
    }

    function renderTurnstile() {
      if (cancelled || turnstileWidgetRef.current !== null || !window.turnstile?.render || !turnstileContainerRef.current) return;
      try {
        const widgetSize = turnstileSizeForWidth(turnstileContainerRef.current.clientWidth);
        turnstileContainerRef.current.dataset.widgetSize = widgetSize;
        turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: "feedback",
          size: widgetSize,
          callback: (token) => {
            setTurnstileToken(token);
            setSecurityState("ready");
          },
          "expired-callback": () => {
            setTurnstileToken("");
            setSecurityState("expired");
          },
          "error-callback": () => {
            setTurnstileToken("");
            setSecurityState("error");
          },
        });
        setSecurityState("ready");
        window.clearTimeout(failureTimer);
      } catch {
        markSecurityError();
      }
    }

    let script = document.querySelector('script[data-apc-turnstile="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.apcTurnstile = "true";
      document.head.append(script);
    }
    script.addEventListener("load", renderTurnstile);
    script.addEventListener("error", markSecurityError);
    if (window.turnstile?.render) renderTurnstile();
    failureTimer = window.setTimeout(() => {
      if (turnstileWidgetRef.current === null) markSecurityError();
    }, REQUEST_TIMEOUT_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(failureTimer);
      script?.removeEventListener("load", renderTurnstile);
      script?.removeEventListener("error", markSecurityError);
      if (turnstileWidgetRef.current !== null && window.turnstile?.remove) window.turnstile.remove(turnstileWidgetRef.current);
      turnstileWidgetRef.current = null;
    };
  }, [securityAttempt, shouldLoadSecurity]);

  function updateFeedback(field, value) {
    setFeedback((current) => ({ ...current, [field]: value }));
    if (status.state === "error") setStatus({ state: "idle", message: "", field: "" });
  }

  function retrySecurityCheck() {
    setTurnstileToken("");
    setSecurityState("loading");
    if (!window.turnstile) document.querySelector('script[data-apc-turnstile="true"]')?.remove();
    setSecurityAttempt((attempt) => attempt + 1);
  }

  function resetFeedback() {
    setFeedback(emptyFeedback);
    setReference("");
    setCopyStatus("");
    setStatus({ state: "idle", message: "", field: "" });
    setTurnstileToken("");
    setSecurityState(TURNSTILE_SITE_KEY ? "loading" : "unavailable");
    setSecurityAttempt((attempt) => attempt + 1);
  }

  async function copyReference() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(reference);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Select and copy the reference.");
    }
  }

  async function submitFeedback(event) {
    event.preventDefault();
    if (submitInFlightRef.current) return;
    if (!feedback.helpfulness) {
      setStatus({ state: "error", message: "Choose an answer to the first question.", field: "helpfulness" });
      firstHelpfulnessRef.current?.focus();
      return;
    }
    if (!navigator.onLine) {
      setStatus({ state: "error", message: "Not sent. Reconnect to the internet and try again.", field: "" });
      return;
    }
    if (!TURNSTILE_SITE_KEY || securityState === "unavailable") {
      setStatus({ state: "error", message: "Feedback is not available yet. Please try again later.", field: "" });
      return;
    }
    if (securityState !== "ready" || !turnstileToken) {
      setStatus({ state: "error", message: "Complete the security check before submitting.", field: "security" });
      return;
    }

    submitInFlightRef.current = true;
    setStatus({ state: "submitting", message: "Sending feedback…", field: "" });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...feedback, turnstileToken }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Feedback could not be sent.");
      if (typeof result.reference !== "string" || !result.reference) throw new Error("Feedback confirmation was incomplete.");

      setFeedback(emptyFeedback);
      setReference(result.reference);
      setStatus({ state: "success", message: "Feedback received.", field: "" });
      if (turnstileWidgetRef.current !== null && window.turnstile?.remove) window.turnstile.remove(turnstileWidgetRef.current);
      turnstileWidgetRef.current = null;
      setTurnstileToken("");
    } catch (error) {
      const message = !navigator.onLine
        ? "Not sent. Reconnect to the internet and try again."
        : error.name === "AbortError"
          ? "Not sent. The request took too long. Please try again."
          : error.message || "Your feedback could not be sent. Please try again later.";
      setStatus({ state: "error", message, field: "" });
      if (turnstileWidgetRef.current !== null && window.turnstile?.reset) window.turnstile.reset(turnstileWidgetRef.current);
      setTurnstileToken("");
    } finally {
      window.clearTimeout(timeout);
      submitInFlightRef.current = false;
    }
  }

  const helpfulnessError = status.state === "error" && status.field === "helpfulness";
  const submissionUnavailable = !TURNSTILE_SITE_KEY || securityState !== "ready" || !turnstileToken;

  return (
    <section ref={sectionRef} id="feedback" className="section feedback-section more-panel apc-section-stop" aria-labelledby="feedback-title" hidden={hidden}>
      <div className="page-width feedback-layout">
        <div className="feedback-intro">
          <div className="feedback-title-row">
            <p className="section-label">Help improve this app</p>
            <button type="button" className="button secondary" onClick={onClose}>Close feedback</button>
          </div>
          <h2 id="feedback-title" ref={headingRef} tabIndex="-1">What could work better for you?</h2>
          <p>Tell APC what made the app clearer or harder to use. This form is about the app, not your child.</p>
          <p className="feedback-monitoring">Feedback is not monitored for urgent help, and APC may not reply.</p>
          <details className="feedback-details">
            <summary>What is sent</summary>
            <p>No account, name or email required. No child profile or selected action is attached. APC receives the answers you submit, the app version and date. Comments older than 90 days are removed during APC’s monthly review. Cloudflare Turnstile processes technical security data.</p>
          </details>
        </div>

        {status.state === "success" ? (
          <div className="feedback-confirmation" role="status">
            <strong>Thank you. APC received your feedback.</strong>
            <p>No name or email was requested.</p>
            <div className="feedback-reference">
              <span>Submission reference</span>
              <code>{reference}</code>
              <button className="button secondary" type="button" onClick={copyReference}>Copy reference</button>
            </div>
            <p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>
            <p>Keep this reference if you may ask APC to remove your optional comment.</p>
            <button className="button secondary" type="button" onClick={resetFeedback}>Send another response</button>
          </div>
        ) : <form className="feedback-form" onSubmit={submitFeedback} noValidate aria-busy={status.state === "submitting"}>
          <fieldset aria-required="true" aria-invalid={helpfulnessError} aria-describedby={helpfulnessError ? "helpfulness-error" : undefined}>
            <legend>Did this help you choose a next step?</legend>
            <div className="feedback-chips">
              {helpfulnessOptions.map((option, index) => (
                <label key={option.value} className="choice-chip">
                  <input
                    ref={index === 0 ? firstHelpfulnessRef : undefined}
                    type="radio"
                    name="helpfulness"
                    value={option.value}
                    required={index === 0}
                    checked={feedback.helpfulness === option.value}
                    onChange={(event) => updateFeedback("helpfulness", event.target.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {helpfulnessError && <p id="helpfulness-error" className="field-error" role="alert">{status.message}</p>}
          </fieldset>

          <label className="feedback-field">
            <span>What needs improving? <small>Optional</small></span>
            <select value={feedback.category} onChange={(event) => updateFeedback("category", event.target.value)}>
              <option value="">Choose one if relevant</option>
              {improvementOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="feedback-field" htmlFor="feedback-comment">
            <span>Anything else? <small>Optional</small></span>
            <textarea
              id="feedback-comment"
              value={feedback.comment}
              maxLength="300"
              aria-describedby="feedback-privacy feedback-count"
              placeholder="Tell APC what could be clearer"
              onChange={(event) => updateFeedback("comment", event.target.value)}
            />
          </label>
          <div className="feedback-meta">
            <p id="feedback-privacy">Please do not include names, diagnoses, schools, contact details or private information about a child.</p>
            <span id="feedback-count">{feedback.comment.length}/300</span>
          </div>

          <label className="bot-field" aria-hidden="true">
            Website
            <input
              type="text"
              name="website"
              value={feedback.website}
              tabIndex="-1"
              autoComplete="off"
              onChange={(event) => updateFeedback("website", event.target.value)}
            />
          </label>

          {TURNSTILE_SITE_KEY ? (
            <div className="security-area">
              <div className="turnstile-slot" ref={turnstileContainerRef} aria-label="Security check" />
              {securityState === "loading" && <p className="security-note" role="status">Loading security check…</p>}
              {securityState === "expired" && <p className="security-note is-error" role="status">The security check expired. Complete it again to submit.</p>}
              {securityState === "error" && <p className="security-note is-error" role="alert">The security check did not load. <button type="button" onClick={retrySecurityCheck}>Try again</button></p>}
            </div>
          ) : <p className="security-note is-error" role="status">Secure feedback submission is not available in this preview.</p>}

          <p className="feedback-consent">By submitting, you send these answers to APC for product improvement. Read the <a href={PRIVACY_URL}>privacy information</a> for retention, deletion and Cloudflare security processing.</p>
          <button className="button primary" type="submit" disabled={status.state === "submitting" || submissionUnavailable}>
            {status.state === "submitting" ? "Sending…" : "Submit feedback"}
          </button>
          {!helpfulnessError && <p className={`feedback-status ${status.state === "error" ? "is-error" : ""}`} role={status.state === "error" ? "alert" : "status"} aria-live="polite">{status.message}</p>}
        </form>}
      </div>
    </section>
  );
}
