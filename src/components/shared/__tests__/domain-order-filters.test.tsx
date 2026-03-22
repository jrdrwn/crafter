import { render, screen, waitFor } from '@testing-library/react';

import {
  DomainFilterCombobox,
  OrderFilterCombobox,
} from '../domain-order-filters';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('Combobox Filter Domain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('merender combobox filter domain', async () => {
    render(<DomainFilterCombobox />);

    await waitFor(() => {
      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });
  });
});

describe('Combobox Filter Urutan', () => {
  it('merender combobox filter urutan', () => {
    render(<OrderFilterCombobox />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('merender dengan urutan yang dipilih', () => {
    render(<OrderFilterCombobox value="recent" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });
});
