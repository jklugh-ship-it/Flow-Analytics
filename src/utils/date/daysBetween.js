export function daysBetween(a, b) {
  if (!a || !b) return null;
  const ms = b - a;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}