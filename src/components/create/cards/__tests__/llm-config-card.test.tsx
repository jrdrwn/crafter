import { render, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import LLMConfigCard from '../llm-config-card';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Helper component
function LLMConfigCardWrapper() {
  const form = useForm({
    defaultValues: {
      llmModel: { key: 'gemini', label: 'Gemini' },
      language: { key: 'en', label: 'English' },
      useRAG: false,
    },
  });
  return <LLMConfigCard control={form.control} />;
}

describe('Kartu Konfigurasi LLM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('merender kartu konfigurasi llm', async () => {
    const { container } = render(<LLMConfigCardWrapper />);

    await waitFor(() => {
      expect(
        container.querySelector('[class*="card"]') ||
          container.querySelector('div'),
      ).toBeInTheDocument();
    });
  });
});
