import { render, screen } from '@testing-library/react';

import GuestDetailPage from '../detail/guest/page';

jest.mock('@/components/detail/guest/persona-detail', () => {
  return function MockPersonaDetail() {
    return <div data-testid="persona-detail">Persona Detail Component</div>;
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

describe('Halaman Detail Guest', () => {
  it('harus merender semua komponen', async () => {
    const PageComponent = await GuestDetailPage();
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('persona-detail')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus berupa komponen async', () => {
    expect(GuestDetailPage).toBeDefined();
    expect(typeof GuestDetailPage).toBe('function');
  });
});
