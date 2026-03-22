import { render } from '@testing-library/react';

import Hero from '../hero';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'contrib.hero.badge-full': 'Knowledge Base',
      'contrib.hero.badge-short': 'KB',
      'contrib.hero.title': 'Knowledge Base',
      'contrib.hero.desc': 'Manage your knowledge contributions',
    };
    return translations[key] || key;
  },
}));

describe('Hero Basis Pengetahuan', () => {
  it('merender bagian hero', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
