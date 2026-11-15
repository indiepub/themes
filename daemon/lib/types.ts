import type { interactionCounts, interactionsFor } from '@indiepub/stator/server/entries';

export type Counts = NonNullable<ReturnType<ReturnType<typeof interactionCounts>['get']>>;
export type Interaction = ReturnType<typeof interactionsFor>['likes'][number];
