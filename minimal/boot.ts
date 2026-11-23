import { indiepubBoot } from '@indiepub/stator/server/boot';
import { defineBoot } from '@statorjs/stator/server';

export default defineBoot(
  indiepubBoot({
    newsletterDesign: {
      accent: '#2563eb',
      background: '#ffffff',
      surface: '#ffffff',
      text: '#1a1a1a',
    },
  }),
);
