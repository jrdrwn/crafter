import { render, screen } from '@testing-library/react';

import LoginPage from './page';

jest.mock('@/components/login/login-form', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Login Form</div>;
  };
});

jest.mock('@/components/shared/end-cta', () => {
  return function MockEndCTA() {
    return <div data-testid="end-cta">End CTA</div>;
  };
});

jest.mock('@/components/shared/footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

jest.mock('@/components/shared/header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

describe('Login Page', () => {
  it('should render all components', () => {
    render(<LoginPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render components in correct order', () => {
    const { container } = render(<LoginPage />);

    const sections = container.querySelectorAll('[data-testid]');
    const order = Array.from(sections).map((el) =>
      el.getAttribute('data-testid'),
    );

    expect(order).toEqual(['header', 'login-form', 'end-cta', 'footer']);
  });
});
