import { render, screen } from '@testing-library/react';

import GuestHistoryPage from '../history/guest/page';

jest.mock('@/components/history/guest/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Guest History Hero</div>;
  };
});

jest.mock('@/components/history/guest/persona-items', () => {
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

describe('Guest History Page', () => {
  it('should render all components', () => {
    render(<GuestHistoryPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('persona-items')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
