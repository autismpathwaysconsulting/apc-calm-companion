import test from "node:test";
import assert from "node:assert/strict";
import { onRequest, validateFeedbackPayload } from "../functions/api/feedback.js";

const endpoint = "https://calm.autismpathwaysconsulting.com/api/feedback";

function createDatabase({ fail = false, resultSuccess = true } = {}) {
  const rows = [];
  return {
    rows,
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async run() {
              if (fail) throw new Error("database unavailable");
              if (!resultSuccess) return { success: false };
              rows.push({ sql, values });
              return { success: true };
            },
          };
        },
      };
    },
  };
}

function validPayload(overrides = {}) {
  return {
    helpfulness: "yes",
    category: "wording",
    comment: "The first choice could be shorter.",
    website: "",
    turnstileToken: "test-token",
    ...overrides,
  };
}

function configuredEnv(database, overrides = {}) {
  return {
    FEEDBACK_DB: database,
    FEEDBACK_APP_VERSION: "1.0.0-beta.1",
    TURNSTILE_SECRET_KEY: "server-only-secret",
    FEEDBACK_ALLOWED_ORIGIN: "https://calm.autismpathwaysconsulting.com",
    FEEDBACK_ALLOWED_HOSTNAME: "calm.autismpathwaysconsulting.com",
    ...overrides,
  };
}

function makeContext(payload, { method = "POST", origin = "https://calm.autismpathwaysconsulting.com", contentType = "application/json", env = {} } = {}) {
  const headers = { "Content-Type": contentType };
  if (origin !== null) headers.Origin = origin;
  return {
    request: new Request(endpoint, { method, headers, body: method === "POST" ? (typeof payload === "string" ? payload : JSON.stringify(payload)) : undefined }),
    env,
  };
}

async function withValidTurnstile(callback) {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ success: true, hostname: "calm.autismpathwaysconsulting.com", action: "feedback" }),
    });
    return await callback();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("valid feedback inserts one allowed row without echoing the comment", { concurrency: false }, async () => {
  await withValidTurnstile(async () => {
    const database = createDatabase();
    const response = await onRequest(makeContext(validPayload(), { env: configuredEnv(database) }));
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(database.rows.length, 1);
    assert.equal(database.rows[0].values[1], "yes");
    assert.equal(database.rows[0].values[2], "wording");
    assert.equal(database.rows[0].values[3], "The first choice could be shorter.");
    assert.equal(database.rows[0].values[4], "1.0.0-beta.1");
    assert.match(body.reference, /^[0-9a-f-]{36}$/i);
    assert.equal(JSON.stringify(body).includes("The first choice"), false);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  });
});

test("honeypot submissions appear successful but insert nothing", async () => {
  const database = createDatabase();
  const response = await onRequest(makeContext(validPayload({ website: "spam.example" }), { env: configuredEnv(database) }));
  assert.equal(response.status, 201);
  assert.equal(database.rows.length, 0);
});

test("invalid methods, origins, content types and payloads fail safely", async (t) => {
  const database = createDatabase();
  const env = configuredEnv(database);
  const cases = [
    ["GET", makeContext(null, { method: "GET", env }), 405],
    ["foreign origin", makeContext(validPayload(), { origin: "https://attacker.example", env }), 403],
    ["missing origin", makeContext(validPayload(), { origin: null, env }), 403],
    ["wrong content type", makeContext("hello", { contentType: "text/plain", env }), 415],
    ["JSONP content type", makeContext(validPayload(), { contentType: "application/jsonp", env }), 415],
    ["invalid JSON", makeContext("{", { env }), 400],
    ["extra field", makeContext(validPayload({ childName: "Private" }), { env }), 400],
    ["client version field", makeContext(validPayload({ appVersion: "spoofed" }), { env }), 400],
    ["invalid enum", makeContext(validPayload({ helpfulness: "calmed" }), { env }), 400],
    ["long comment", makeContext(validPayload({ comment: "x".repeat(301) }), { env }), 400],
    ["large streamed body", makeContext(validPayload({ turnstileToken: "x".repeat(5000), comment: "x".repeat(300) }), { env }), 413],
  ];

  for (const [name, context, expectedStatus] of cases) {
    await t.test(name, async () => assert.equal((await onRequest(context)).status, expectedStatus));
  }
  assert.equal(database.rows.length, 0);
});

test("SQL and HTML-like text is bound as inert data", { concurrency: false }, async () => {
  await withValidTurnstile(async () => {
    const database = createDatabase();
    const comment = "<script>alert(1)</script>'; DROP TABLE feedback; --";
    const response = await onRequest(makeContext(validPayload({ comment }), { env: configuredEnv(database) }));
    assert.equal(response.status, 201);
    assert.equal(database.rows[0].values[3], comment);
    assert.match(database.rows[0].sql, /VALUES \(\?, 1, \?, \?, \?, \?, \?, 'new'\)/);
  });
});

test("database failures and unsuccessful results return a generic retry response", { concurrency: false }, async (t) => {
  await withValidTurnstile(async () => {
    for (const [name, database] of [
      ["database throws", createDatabase({ fail: true })],
      ["D1 reports failure", createDatabase({ resultSuccess: false })],
    ]) {
      await t.test(name, async () => {
        const response = await onRequest(makeContext(validPayload(), { env: configuredEnv(database) }));
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), { error: "Feedback is temporarily unavailable." });
      });
    }
  });
});

test("missing security, release or allow-list configuration fails closed", async () => {
  const database = createDatabase();
  const missingSecret = await onRequest(makeContext(validPayload(), { env: configuredEnv(database, { TURNSTILE_SECRET_KEY: "" }) }));
  assert.equal(missingSecret.status, 503);

  const missingVersion = await onRequest(makeContext(validPayload(), { env: configuredEnv(database, { FEEDBACK_APP_VERSION: "" }) }));
  assert.equal(missingVersion.status, 503);

  const missingAllowedOrigin = await onRequest(makeContext(validPayload(), { env: configuredEnv(database, { FEEDBACK_ALLOWED_ORIGIN: "" }) }));
  assert.equal(missingAllowedOrigin.status, 503);

  const missingAllowedHostname = await onRequest(makeContext(validPayload(), { env: configuredEnv(database, { FEEDBACK_ALLOWED_HOSTNAME: "" }) }));
  assert.equal(missingAllowedHostname.status, 503);

  const mismatchedAllowList = await onRequest(makeContext(validPayload(), { env: configuredEnv(database, { FEEDBACK_ALLOWED_HOSTNAME: "other.example" }) }));
  assert.equal(mismatchedAllowList.status, 503);

  const emptyEnv = await onRequest(makeContext(validPayload(), { env: {} }));
  assert.equal(emptyEnv.status, 503);
  assert.equal(database.rows.length, 0);
});

test("Turnstile hostname and action must match before insertion", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: true, hostname: "calm.autismpathwaysconsulting.com", action: "feedback" }) });
    const database = createDatabase();
    const env = configuredEnv(database);
    const response = await onRequest(makeContext(validPayload(), { env }));
    assert.equal(response.status, 201);
    assert.equal(database.rows.length, 1);

    globalThis.fetch = async () => ({ ok: true, json: async () => ({ success: true, hostname: "attacker.example", action: "feedback" }) });
    const rejected = await onRequest(makeContext(validPayload({ turnstileToken: "forged-token" }), { env }));
    assert.equal(rejected.status, 400);
    assert.equal(database.rows.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("official Turnstile dummy credentials work only in explicit preview test mode", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ success: true, hostname: "example.com", action: null }),
    });

    const testSecret = "1x0000000000000000000000000000000AA";
    const dummyPayload = validPayload({ turnstileToken: "XXXX.DUMMY.TOKEN.XXXX" });

    const previewDatabase = createDatabase();
    const previewEnv = configuredEnv(previewDatabase, {
      TURNSTILE_SECRET_KEY: testSecret,
      FEEDBACK_TURNSTILE_TEST_MODE: "true",
    });
    const accepted = await onRequest(makeContext(dummyPayload, { env: previewEnv }));
    assert.equal(accepted.status, 201);
    assert.equal(previewDatabase.rows.length, 1);

    const unflaggedDatabase = createDatabase();
    const unflaggedEnv = configuredEnv(unflaggedDatabase, { TURNSTILE_SECRET_KEY: testSecret });
    const unflagged = await onRequest(makeContext(dummyPayload, { env: unflaggedEnv }));
    assert.equal(unflagged.status, 400);
    assert.equal(unflaggedDatabase.rows.length, 0);

    const wrongTokenDatabase = createDatabase();
    const wrongTokenEnv = configuredEnv(wrongTokenDatabase, {
      TURNSTILE_SECRET_KEY: testSecret,
      FEEDBACK_TURNSTILE_TEST_MODE: "true",
    });
    const wrongToken = await onRequest(makeContext(validPayload({ turnstileToken: "not-the-dummy-token" }), { env: wrongTokenEnv }));
    assert.equal(wrongToken.status, 400);
    assert.equal(wrongTokenDatabase.rows.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Function responses include their own security headers", async () => {
  const response = await onRequest(makeContext(validPayload(), { origin: null, env: configuredEnv(createDatabase()) }));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("Content-Security-Policy"), "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  assert.equal(response.headers.get("Strict-Transport-Security"), "max-age=31536000; includeSubDomains");
  assert.equal(response.headers.get("X-Frame-Options"), "DENY");
});

test("payload validation accepts no child, contact, device or client-version fields", () => {
  assert.equal(validateFeedbackPayload(validPayload()).ok, true);
  for (const field of ["name", "email", "child", "diagnosis", "selectedAction", "ip", "userAgent", "deviceId", "appVersion"]) {
    assert.equal(validateFeedbackPayload(validPayload({ [field]: "not allowed" })).ok, false, `unexpected allowed field: ${field}`);
  }
});
