export function shortDate(d: Date | undefined): string {
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export function longDate(d: Date | undefined): string {
  return d
    ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';
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
