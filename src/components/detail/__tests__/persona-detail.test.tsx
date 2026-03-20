import { render, waitFor } from '@testing-library/react';
import PersonaDetail from '../persona-detail';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
  }),
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

describe('PersonaDetail', () => {
  it('renders skeleton when loading', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    const { container } = render(<PersonaDetail personaId="1" />);

    const skeleton = container.querySelector('[class*="skeleton"]') || container.querySelector('section');
    expect(skeleton).toBeInTheDocument();
  });
});
