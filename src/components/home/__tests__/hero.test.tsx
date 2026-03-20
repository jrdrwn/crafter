import { render, screen } from '@testing-library/react';

import Hero from '../hero';

// Mock untuk next-intl
jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'badge': 'AI-Powered',
      'title': 'Create Persona',
      'subtitle': 'Create detailed personas with AI',
      'start': 'Start Creating',
      'history': 'History',
      'continue': 'Continue',
      'join': 'Join Now',
      'trusted': 'Trusted by professionals',
      'roles.0': 'Marketers',
      'roles.1': 'Designers',
      'roles.2': 'Developers',
      'roles.3': 'Product Managers',
    };
    return translations[key] || key;
  },
}));

// Mock untuk next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock untuk User Context
jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: null,
    isLoading: false,
  }),
}));

describe('Hero', () => {
  it('renders hero section with badge', () => {
    render(<Hero />);
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
  });

  it('renders hero title', () => {
    render(<Hero />);
    expect(screen.getByText('Create Persona')).toBeInTheDocument();
  });

  it('renders hero subtitle', () => {
    render(<Hero />);
    expect(
      screen.getByText('Create detailed personas with AI'),
    ).toBeInTheDocument();
  });

  it('renders CTA buttons for guest user', () => {
    render(<Hero />);
    expect(screen.getByText('Continue')).toBeInTheDocument();
    expect(screen.getByText('Join Now')).toBeInTheDocument();
  });

  it('renders trusted section', () => {
    render(<Hero />);
    expect(screen.getByText('Trusted by professionals')).toBeInTheDocument();
  });

  it('renders role tags', () => {
    render(<Hero />);
    expect(screen.getByText('Marketers')).toBeInTheDocument();
    expect(screen.getByText('Designers')).toBeInTheDocument();
    expect(screen.getByText('Developers')).toBeInTheDocument();
    expect(screen.getByText('Product Managers')).toBeInTheDocument();
  });
});
