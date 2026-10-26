export function hasDeviceConsent(browser) {
  try {
    return browser?.localStorage.getItem("apc-calm-companion-storage-consent") === "yes";
  } catch {
    return false;
  }
}

export function remainingSeconds(deadline, now) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function restoreViewFocus(preferred, fallback) {
  const visible = (element) => element?.isConnected && element.getClientRects().length > 0;
  const target = visible(preferred) ? preferred : fallback;
  if (visible(target)) target.focus({ preventScroll: true });
}
