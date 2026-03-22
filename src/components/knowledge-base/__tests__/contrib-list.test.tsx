import { render, waitFor } from '@testing-library/react';

import ContribList from '../contrib-list';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    loading: false,
  }),
}));

describe('Daftar Kontribusi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [],
        total: 0,
        nextOffset: null,
        status: true,
      }),
    });
  });

  it('merender container daftar kontribusi', async () => {
    const { container } = render(<ContribList />);

    await waitFor(() => {
      expect(
        container.querySelector('section') ||
          container.querySelector('[class*="card"]'),
      ).toBeInTheDocument();
    });
  });
});
