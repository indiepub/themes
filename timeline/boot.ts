import { indiepubBoot } from '@indiepub/stator/server/boot';
import { defineBoot } from '@statorjs/stator/server';

export default defineBoot(
  indiepubBoot({
    newsletterDesign: {
      accent: '#006e83',
      background: '#e8eced',
      surface: '#f6f9f9',
      text: '#070a0a',
    },
  }),
);
