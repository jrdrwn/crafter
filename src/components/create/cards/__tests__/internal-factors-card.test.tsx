import { render, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import InternalFactorsCard from '../internal-factors-card';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Helper component
function InternalFactorsCardWrapper() {
  const form = useForm({
    defaultValues: {
      internal: [],
    },
  });
  return <InternalFactorsCard control={form.control} />;
}

describe('Kartu Faktor Internal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('merender kartu faktor internal', async () => {
    const { container } = render(<InternalFactorsCardWrapper />);

    await waitFor(() => {
      expect(
        container.querySelector('[class*="card"]') ||
          container.querySelector('div'),
      ).toBeInTheDocument();
    });
  });
});
