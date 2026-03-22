import { render, screen } from '@testing-library/react';

import Persona from '../persona';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'detail.select-narration-structure': 'Select Structure',
      'detail.mixed': 'Mixed',
      'detail.bullets': 'Bullets',
      'detail.narrative': 'Narrative',
      'detail.persona-name-fallback': 'Unknown Persona',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const mockGuestPersona = {
  result: {
    full_name: 'Guest Persona',
    quote: 'Guest quote',
    mixed: '<p>Mixed content</p>',
    bullets: '<ul><li>Bullet 1</li></ul>',
    narative: '<p>Narrative content</p>',
  },
  taxonomy: {
    domain: {
      label: 'Technology',
    },
  },
};

describe('Persona Guest', () => {
  it('merender persona guest dengan nama', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Guest Persona')).toBeInTheDocument();
  });

  it('merender persona guest dengan quote', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Guest quote')).toBeInTheDocument();
  });

  it('merender persona guest dengan domain', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('merender tombol pemilih gaya', () => {
    render(<Persona markdown={mockGuestPersona} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
