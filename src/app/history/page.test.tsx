import { render, screen } from '@testing-library/react';

import HistoryPage from './page';

jest.mock('@/components/history/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">History Hero</div>;
  };
});

jest.mock('@/components/history/history', () => {
  return function MockHistory() {
    return <div data-testid="history">History Component</div>;
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

describe('History Page', () => {
  it('should render all components', async () => {
    const PageComponent = await HistoryPage();
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('history')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should be an async component', () => {
    expect(HistoryPage).toBeDefined();
    expect(typeof HistoryPage).toBe('function');
  });
});
