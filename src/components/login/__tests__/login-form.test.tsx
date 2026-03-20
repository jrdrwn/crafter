import { render, screen } from '@testing-library/react';

import LoginForm from '../login-form';

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

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Login',
      description: 'Sign in to your account',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      button: 'Sign In',
      success: 'Login successful',
      failed: 'Login failed',
      noAccount: "Don't have an account?",
      createNow: 'Create one',
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoginForm', () => {
  it('renders login form with email input', () => {
    render(<LoginForm />);
    const emailInput = document.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<LoginForm />);
    const passwordInput = document.querySelector('input[type="password"]');
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', {
      name: /sign in/i,
      type: 'submit',
    });
    expect(submitButton).toBeInTheDocument();
  });

  it('renders create account link', () => {
    render(<LoginForm />);
    const createAccountLink = screen.getByRole('link', { name: /create/i });
    expect(createAccountLink).toBeInTheDocument();
    expect(createAccountLink).toHaveAttribute('href', '/create-account');
  });
});
