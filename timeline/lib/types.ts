import type { getAuthor, interactionCounts, InteractionGroups } from '@indiepub/stator/server/entries';

export type Author = ReturnType<typeof getAuthor>;
export type InteractionCounts = NonNullable<ReturnType<ReturnType<typeof interactionCounts>['get']>>;
export type Interaction = InteractionGroups['likes'][number];
