export function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (isNaN(d)) return null;

    const inputDate = trimmed.slice(0, 10);
    const parsedDate = d.toISOString().slice(0, 10);
    if (inputDate !== parsedDate) return null;

    return d;
  }

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