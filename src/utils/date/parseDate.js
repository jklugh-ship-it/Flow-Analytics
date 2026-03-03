export function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  // ISO YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d)) return null;

    // Extract intended Y-M-D from the input string
    const [y, m, day] = trimmed.slice(0, 10).split("-").map(Number);

    // Normalize to UTC midnight
    const normalized = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    );

    // Reject rollover dates (e.g., 2024-02-30 → 2024-03-01)
    if (
      normalized.getUTCFullYear() !== y ||
      normalized.getUTCMonth() + 1 !== m ||
      normalized.getUTCDate() !== day
    ) {
      return null;
    }

    return normalized;
  }

  // MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [m, d, y] = trimmed.split("/").map(Number);
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    const date = new Date(Date.UTC(y, m - 1, d));
    if (
      date.getUTCFullYear() !== y ||
      date.getUTCMonth() !== m - 1 ||
      date.getUTCDate() !== d
    ) {
      return null;
    }

    return date;
  }

  return null;
}