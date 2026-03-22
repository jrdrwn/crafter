import { render, screen, waitFor } from '@testing-library/react';

import { ContribEditDialog } from '../contrib-edit-dialog';

// Mock fetch
global.fetch = jest.fn();

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Dialog Edit Kontribusi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merender dialog edit saat terbuka', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          text: 'Test content',
          type: 'review',
          domain_key: 'tech',
          language_key: 'en',
          source: 'test source',
          metadata: { visibility: 'public' },
        },
      }),
    });

    render(
      <ContribEditDialog
        id={1}
        open={true}
        onOpenChangeAction={() => {}}
        onSavedAction={() => {}}
        token="test-token"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
