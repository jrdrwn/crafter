import { render, waitFor } from '@testing-library/react';
import PersonaItems from '../persona-items';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/explore',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
  }),
}));

describe('Explore PersonaItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], total: 0 }),
    });
  });

  it('renders persona items container', async () => {
    const { container } = render(<PersonaItems />);

    await waitFor(() => {
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });
});
