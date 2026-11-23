export function longDate(d: Date | undefined): string {
  return d ? d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
}

export function shortDate(d: Date | undefined): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export function monthDay(d: Date | undefined): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
}

/** 1234 → "1.2k", 12345 → "12k". */
export function compactCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

export function byYear<T extends { publishedAt?: Date }>(entries: T[]): Array<{ year: number; entries: T[] }> {
  const groups = new Map<number, T[]>();
  for (const entry of entries) {
    const year = entry.publishedAt?.getFullYear() ?? 0;
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, entries]) => ({ year, entries }));
}

export const PER_PAGE = 20;

/** The `?page=` number, from 1. */
export function pageOf(query: Record<string, unknown>): number {
  return Math.max(1, Number.parseInt(String(query.page ?? '1'), 10) || 1);
}

/** Fetches one extra row to learn whether an older page exists. */
export function paginate<T>(fetch: (limit: number, offset: number) => T[], page: number) {
  const rows = fetch(PER_PAGE + 1, (page - 1) * PER_PAGE);
  return { items: rows.slice(0, PER_PAGE), hasPrev: page > 1, hasNext: rows.length > PER_PAGE };
}

