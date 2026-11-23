import { indiepubBoot } from '@indiepub/stator/server/boot';
import { defineBoot } from '@statorjs/stator/server';

export default defineBoot(
  indiepubBoot({
    newsletterDesign: {
      accent: '#9d4700',
      background: '#f8f5ef',
      surface: '#fdfbf9',
      text: '#17100b',
      headingFont: 'transitional',
    },
  }),
);
