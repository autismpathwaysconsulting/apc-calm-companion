export function turnstileSizeForWidth(containerWidth) {
  return Number.isFinite(containerWidth) && containerWidth < 300 ? "compact" : "flexible";
}
