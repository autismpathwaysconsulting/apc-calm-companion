export const PROFILE_STORAGE_KEY = "apc-calm-companion-profile-v1";

export function normaliseProfileName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

export function profileInitials(value) {
  const words = normaliseProfileName(value).split(" ").filter(Boolean);
  if (!words.length) return "";
  const first = Array.from(words[0])[0] || "";
  const last = words.length > 1 ? Array.from(words.at(-1))[0] || "" : "";
  return `${first}${last}`.toLocaleUpperCase("en-MY");
}

export function formatToday(date = new Date(), locale = "en-MY") {
  const validDate = date instanceof Date && Number.isFinite(date.getTime()) ? date : new Date();
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(validDate);
}

function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function loadProfileName(storage = browserStorage()) {
  if (!storage) return "";
  try {
    const saved = JSON.parse(storage.getItem(PROFILE_STORAGE_KEY) || "null");
    if (saved?.version !== 1) return "";
    return normaliseProfileName(saved.displayName);
  } catch {
    return "";
  }
}

export function saveProfileName(value, storage = browserStorage()) {
  const displayName = normaliseProfileName(value);
  if (!storage) return displayName;
  try {
    if (displayName) storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ version: 1, displayName }));
    else storage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // The app remains usable when private browsing or device policy blocks storage.
  }
  return displayName;
}
