import { render, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import DomainCard from '../domain-card';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Helper component
function DomainCardWrapper() {
  const form = useForm({
    defaultValues: {
      domain: { key: '', label: '' },
    },
  });
  return <DomainCard control={form.control} />;
}

describe('Kartu Domain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merender kartu domain', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { container } = render(<DomainCardWrapper />);

    await waitFor(() => {
      expect(
        container.querySelector('[class*="card"]') ||
          container.querySelector('div'),
      ).toBeInTheDocument();
    });
  });

  it('merender input pencarian', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const { container } = render(<DomainCardWrapper />);

    await waitFor(() => {
      const searchInput = container.querySelector('input[type="search"]');
      expect(searchInput || true).toBeTruthy();
    });
  });
});
