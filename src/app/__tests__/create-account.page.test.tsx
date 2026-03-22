import { render, screen } from '@testing-library/react';

import CreateAccountPage from '../create-account/page';

jest.mock('@/components/create-account/create-account-form', () => {
  return function MockCreateAccountForm() {
    return <div data-testid="create-account-form">Create Account Form</div>;
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

describe('Halaman Buat Akun', () => {
  it('harus merender semua komponen', () => {
    render(<CreateAccountPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('create-account-form')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus merender komponen dalam urutan yang benar', () => {
    const { container } = render(<CreateAccountPage />);

    const sections = container.querySelectorAll('[data-testid]');
    const order = Array.from(sections).map((el) =>
      el.getAttribute('data-testid'),
    );

    expect(order).toEqual([
      'header',
      'create-account-form',
      'end-cta',
      'footer',
    ]);
  });

  it('harus berupa komponen fungsi', () => {
    expect(CreateAccountPage).toBeDefined();
    expect(typeof CreateAccountPage).toBe('function');
  });
});
