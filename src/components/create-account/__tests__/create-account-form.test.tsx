import { render, screen } from '@testing-library/react';

import CreateAccountForm from '../create-account-form';

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

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Create Account',
      'description': 'Join us today',
      'name': 'Name',
      'name-placeholder': 'Enter your name',
      'email': 'Email',
      'email-placeholder': 'Enter your email',
      'password': 'Password',
      'password-placeholder': 'Enter your password',
      'confirm-password': 'Confirm Password',
      'terms-prefix': 'I agree to the',
      'terms-link': 'Terms and Conditions',
      'button': 'Sign Up',
      'success': 'Account created',
      'error-generic': 'An error occurred',
      'error-password-mismatch': 'Passwords do not match',
      'already-account': 'Already have an account?',
      'login-link': 'Login',
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

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Formulir Buat Akun', () => {
  it('merender input nama', () => {
    render(<CreateAccountForm />);
    const nameInput = document.querySelector('input[type="text"]');
    expect(nameInput).toBeInTheDocument();
  });

  it('merender input email', () => {
    render(<CreateAccountForm />);
    const emailInput = document.querySelector('input[type="email"]');
    expect(emailInput).toBeInTheDocument();
  });

  it('merender input password', () => {
    render(<CreateAccountForm />);
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('merender checkbox syarat', () => {
    render(<CreateAccountForm />);
    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it('merender tombol submit', () => {
    render(<CreateAccountForm />);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('merender link login', () => {
    render(<CreateAccountForm />);
    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
