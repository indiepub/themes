const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const dateCompactFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatDateCompact(date: Date): string {
  return dateCompactFormatter.format(date);
}

/** ISO 8601 string for datetime attributes */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** Extract displayable hostname from a URL */
export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
