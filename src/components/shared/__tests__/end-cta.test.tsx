import { render, screen } from '@testing-library/react';

import EndCta from '../end-cta';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'ready-to-get-started': 'Ready to Start?',
      'join-thousands': 'Join thousands of users',
      'try-for-free-now': 'Get Started',
      'learn-more': 'Learn More',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('EndCta', () => {
  it('renders CTA title', () => {
    render(<EndCta />);
    expect(screen.getByText('Ready to Start?')).toBeInTheDocument();
  });

  it('renders CTA subtitle', () => {
    render(<EndCta />);
    expect(screen.getByText('Join thousands of users')).toBeInTheDocument();
  });

  it('renders CTA button', () => {
    render(<EndCta />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
