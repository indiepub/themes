import { indiepubMiddleware } from '@indiepub/stator/server/middleware';
import { defineMiddleware } from '@statorjs/stator/server';

export default defineMiddleware(indiepubMiddleware());
