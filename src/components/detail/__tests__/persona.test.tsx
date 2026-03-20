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
      'detail.word-count': 'Words:',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const mockPersona = {
  id: 1,
  result: {
    full_name: 'Test Persona',
    quote: 'Test quote',
    mixed: '<p>Mixed content</p>',
    bullets: '<ul><li>Bullet 1</li></ul>',
    narative: '<p>Narrative content</p>',
    image_url: 'https://example.com/image.jpg',
  },
  domain: { label: 'Marketing' },
  user: { id: 1, name: 'John Doe', email: 'john@example.com' },
  visibility: 'public' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

describe('Persona', () => {
  it('renders persona with name', () => {
    render(<Persona persona={mockPersona} />);
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('renders persona with quote', () => {
    render(<Persona persona={mockPersona} />);
    expect(screen.getByText('Test quote')).toBeInTheDocument();
  });

  it('renders persona with domain badge', () => {
    render(<Persona persona={mockPersona} />);
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('renders style selector buttons', () => {
    render(<Persona persona={mockPersona} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });
});
