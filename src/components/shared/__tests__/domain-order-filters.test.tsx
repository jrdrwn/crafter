import { render, screen, waitFor } from '@testing-library/react';
import { DomainFilterCombobox, OrderFilterCombobox } from '../domain-order-filters';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('DomainFilterCombobox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('renders domain filter combobox', async () => {
    render(<DomainFilterCombobox />);

    await waitFor(() => {
      const button = screen.getByRole('combobox');
      expect(button).toBeInTheDocument();
    });
  });
});

describe('OrderFilterCombobox', () => {
  it('renders order filter combobox', () => {
    render(<OrderFilterCombobox />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('renders with selected order', () => {
    render(<OrderFilterCombobox value="recent" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });
});
