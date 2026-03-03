export function formatDate(d) {
  if (!(d instanceof Date) || isNaN(d)) {
    throw new Error("formatDate expects a valid Date instance");
  }
  return d.toISOString().slice(0, 10);
}