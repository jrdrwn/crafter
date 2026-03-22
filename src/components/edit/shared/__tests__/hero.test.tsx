import { render } from '@testing-library/react';

import Hero from '../hero';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'edit.hero-badge': 'Edit',
      'edit.hero-title': 'Edit Persona',
      'edit.hero-desc-part1': 'Modify your',
      'edit.hero-desc-part2': 'persona',
      'edit.hero-desc-part3': 'details',
    };
    return translations[key] || key;
  },
}));

describe('Hero Edit', () => {
  it('merender bagian hero', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
