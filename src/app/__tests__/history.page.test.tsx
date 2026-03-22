import { render, screen } from '@testing-library/react';

import HistoryPage from '../history/page';

jest.mock('@/components/history/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">History Hero</div>;
  };
});

jest.mock('@/components/history/persona-items', () => {
  return function MockPersonaItems() {
    return <div data-testid="persona-items">Persona Items Component</div>;
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

describe('Halaman Riwayat', () => {
  it('harus merender semua komponen', () => {
    render(<HistoryPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('persona-items')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus berupa komponen fungsi', () => {
    expect(HistoryPage).toBeDefined();
    expect(typeof HistoryPage).toBe('function');
  });
});
