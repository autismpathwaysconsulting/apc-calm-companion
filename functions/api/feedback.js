const MAX_BODY_BYTES = 4096;
const MAX_COMMENT_LENGTH = 300;
const TURNSTILE_TIMEOUT_MS = 8000;
const TURNSTILE_ALWAYS_PASS_TEST_SECRET = "1x0000000000000000000000000000000AA";
const TURNSTILE_DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";
const helpfulnessValues = new Set(["yes", "a-little", "not-yet"]);
const categoryValues = new Set(["", "wording", "too-many-choices", "could-not-find-tool", "tool-did-not-work", "accessibility", "something-else"]);
const allowedKeys = new Set(["helpfulness", "category", "comment", "website", "turnstileToken"]);

function responseHeaders() {
  return {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Type": "application/json; charset=utf-8",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Permitted-Cross-Domain-Policies": "none",
  };
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders() });
}

export function validateFeedbackPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, error: "Invalid feedback." };
  if (Object.keys(payload).some((key) => !allowedKeys.has(key))) return { ok: false, error: "Invalid feedback." };

  const helpfulness = typeof payload.helpfulness === "string" ? payload.helpfulness : "";
  const category = typeof payload.category === "string" ? payload.category : "";
  const comment = typeof payload.comment === "string" ? payload.comment.trim() : "";
  const website = typeof payload.website === "string" ? payload.website.trim() : "";
  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken.trim() : "";

  if (!helpfulnessValues.has(helpfulness) || !categoryValues.has(category)) return { ok: false, error: "Choose a valid feedback option." };
  if (Array.from(comment).length > MAX_COMMENT_LENGTH) return { ok: false, error: "The comment is too long." };
  if (website.length > 200 || turnstileToken.length > 2048) return { ok: false, error: "Invalid feedback." };

  return { ok: true, value: { helpfulness, category, comment, website, turnstileToken } };
}

async function verifyTurnstile(token, env) {
  const secret = env.TURNSTILE_SECRET_KEY;
  const expectedHostname = typeof env.FEEDBACK_ALLOWED_HOSTNAME === "string" ? env.FEEDBACK_ALLOWED_HOSTNAME.trim() : "";
  const testMode = env.FEEDBACK_TURNSTILE_TEST_MODE === "true"
    && secret === TURNSTILE_ALWAYS_PASS_TEST_SECRET;
  if (!secret || !expectedHostname) return { ok: false, unavailable: true };
  if (!token) return { ok: false };

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);
  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    if (!verification.ok) return { ok: false, unavailable: true };
    const result = await verification.json();
    if (testMode) {
      return { ok: result.success === true && token === TURNSTILE_DUMMY_TOKEN };
    }
    return { ok: result.success === true && result.action === "feedback" && result.hostname === expectedHostname };
  } finally {
    clearTimeout(timeout);
  }
}

async function readRequestText(request) {
  if (!request.body) return { ok: true, text: "" };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_BODY_BYTES) {
      await reader.cancel();
      return { ok: false, tooLarge: true };
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return { ok: true, text };
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== "POST") return jsonResponse(405, { error: "Method not allowed." });

  const allowedOrigin = typeof env.FEEDBACK_ALLOWED_ORIGIN === "string" ? env.FEEDBACK_ALLOWED_ORIGIN.trim() : "";
  const allowedHostname = typeof env.FEEDBACK_ALLOWED_HOSTNAME === "string" ? env.FEEDBACK_ALLOWED_HOSTNAME.trim() : "";
  if (!allowedOrigin || !allowedHostname) return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  try {
    const configuredOrigin = new URL(allowedOrigin);
    if (configuredOrigin.protocol !== "https:" || configuredOrigin.origin !== allowedOrigin || configuredOrigin.hostname !== allowedHostname) {
      return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
    }
  } catch {
    return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  }
  const origin = request.headers.get("Origin");
  if (origin !== allowedOrigin) return jsonResponse(403, { error: "Request not allowed." });

  const contentType = request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return jsonResponse(415, { error: "Use JSON to submit feedback." });
  }

  const declaredLength = Number.parseInt(request.headers.get("Content-Length") || "0", 10);
  if (declaredLength > MAX_BODY_BYTES) return jsonResponse(413, { error: "Feedback is too large." });

  let bodyResult;
  try {
    bodyResult = await readRequestText(request);
  } catch {
    return jsonResponse(400, { error: "Invalid feedback." });
  }
  if (!bodyResult.ok && bodyResult.tooLarge) return jsonResponse(413, { error: "Feedback is too large." });
  const bodyText = bodyResult.text;

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    return jsonResponse(400, { error: "Invalid feedback." });
  }

  const validation = validateFeedbackPayload(payload);
  if (!validation.ok) return jsonResponse(400, { error: validation.error });
  const feedback = validation.value;

  const reference = crypto.randomUUID();
  if (feedback.website) return jsonResponse(201, { ok: true, reference });

  const appVersion = typeof env.FEEDBACK_APP_VERSION === "string" ? env.FEEDBACK_APP_VERSION.trim() : "";
  if (!appVersion || appVersion.length > 40 || !/^[a-zA-Z0-9._-]+$/.test(appVersion)) {
    return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  }

  let turnstile;
  try {
    turnstile = await verifyTurnstile(feedback.turnstileToken, env);
  } catch {
    return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  }
  if (turnstile.unavailable) return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  if (!turnstile.ok) return jsonResponse(400, { error: "Complete the security check and try again." });
  if (!env.FEEDBACK_DB?.prepare) return jsonResponse(503, { error: "Feedback is temporarily unavailable." });

  try {
    const result = await env.FEEDBACK_DB.prepare(
      `INSERT INTO feedback
        (id, schema_version, helpfulness, category, comment, app_version, created_at, review_status)
       VALUES (?, 1, ?, ?, ?, ?, ?, 'new')`,
    ).bind(
      reference,
      feedback.helpfulness,
      feedback.category || null,
      feedback.comment || null,
      appVersion,
      new Date().toISOString(),
    ).run();
    if (result?.success !== true) return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  } catch {
    return jsonResponse(503, { error: "Feedback is temporarily unavailable." });
  }

  return jsonResponse(201, { ok: true, reference });
}
