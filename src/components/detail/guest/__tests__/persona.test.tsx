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

describe('Guest Persona', () => {
  it('renders guest persona with name', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Guest Persona')).toBeInTheDocument();
  });

  it('renders guest persona with quote', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Guest quote')).toBeInTheDocument();
  });

  it('renders guest persona with domain', () => {
    render(<Persona markdown={mockGuestPersona} />);
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders style selector buttons', () => {
    render(<Persona markdown={mockGuestPersona} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
