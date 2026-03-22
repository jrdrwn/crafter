import { render } from '@testing-library/react';

import Hero from '../hero';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'explore.hero-badge': 'Explore',
      'explore.hero-title': 'Explore Personas',
      'explore.hero-desc': 'Discover personas created by others',
    };
    return translations[key] || key;
  },
}));

describe('Hero Jelajahi', () => {
  it('merender bagian hero', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
