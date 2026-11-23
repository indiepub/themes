import { reader, type Audience } from '@indiepub/stator/server/access';
import { memberById } from '@indiepub/stator/server/subscribe';

export interface Viewer {
  audience: Audience;
  /** A signed-in member's address. */
  email?: string;
}

/** Who is reading, for the header and for `listEntries({ audience })`. An
 *  anonymous reader leaves the page cacheable; anyone signed in makes it private. */
export function viewerOf(
  request: { claims(): unknown },
  response: { headers: Headers },
): Viewer {
  const audience = reader(request, response);
  if (audience !== 'members' && audience !== 'paid') return { audience };
  const id = (request.claims() as { subscriberId?: string } | undefined)?.subscriberId;
  return { audience, email: id ? memberById(id)?.email : undefined };
}
