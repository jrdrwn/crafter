import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import ContentLengthCard from '../content-length-card';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock Radix UI Portal to avoid DOM issues in tests
jest.mock('@radix-ui/react-tooltip', () => ({
  ...jest.requireActual('@radix-ui/react-tooltip'),
  Portal: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@radix-ui/react-dialog', () => ({
  ...jest.requireActual('@radix-ui/react-dialog'),
  Portal: ({ children }: { children: React.ReactNode }) => children,
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
  value: jest.fn().mockImplementation((query) => ({
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

// Helper component
function ContentLengthCardWrapper() {
  const form = useForm({
    defaultValues: {
      contentLengthRange: [100, 500],
    },
  });
  return <ContentLengthCard control={form.control} />;
}

describe('ContentLengthCard', () => {
  it('renders content length card', () => {
    const { container } = render(<ContentLengthCardWrapper />);
    expect(
      container.querySelector('[class*="card"]') ||
        container.querySelector('div'),
    ).toBeInTheDocument();
  });
});
