import { indiepubBoot } from '@indiepub/stator/server/boot';
import { defineBoot } from '@statorjs/stator/server';

export default defineBoot(
  indiepubBoot({
    newsletterDesign: {
      accent: '#005fad',
      background: '#e9ebee',
      surface: '#f7f9fa',
      text: '#08090b',
    },
  }),
);
