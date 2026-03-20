import { render } from '@testing-library/react';

import Hero from '../hero';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'hero-badge': 'Create',
      'hero-title': 'Create Persona',
      'hero-desc': 'Fill in the details below',
    };
    return translations[key] || key;
  },
}));

describe('Create Hero', () => {
  it('renders hero section', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders badge', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
