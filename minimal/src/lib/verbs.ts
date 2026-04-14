const VERB_DISPLAY: Record<string, string> = {
  watch: '\u{1F4FA} Watched',
  read: '\u{1F4DA} Read',
  listen: '\u{1F3A7} Listened to',
  play: '\u{1F3AE} Played',
};

export function verbLabel(verb: string): string {
  return VERB_DISPLAY[verb] ?? verb;
}
