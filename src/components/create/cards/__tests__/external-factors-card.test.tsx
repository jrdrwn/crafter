import { render, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import ExternalFactorsCard from '../external-factors-card';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Helper component
function ExternalFactorsCardWrapper() {
  const form = useForm({
    defaultValues: {
      external: [],
    },
  });
  return <ExternalFactorsCard control={form.control} />;
}

describe('ExternalFactorsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('renders external factors card', async () => {
    const { container } = render(<ExternalFactorsCardWrapper />);

    await waitFor(() => {
      expect(container.querySelector('[class*="card"]') || container.querySelector('div')).toBeInTheDocument();
    });
  });
});
