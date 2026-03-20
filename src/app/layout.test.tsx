import { render, screen } from '@testing-library/react';

import RootLayout from './layout';

// Mock dependencies
jest.mock('@/components/shared/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

jest.mock('@/contexts/user-context', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
}));

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-intl-provider">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('should render children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with all required providers', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('next-intl-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should have correct HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
    expect(html).toHaveAttribute('suppressHydrationWarning');
  });

  it('should have correct body classes', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('antialiased');
  });
});
