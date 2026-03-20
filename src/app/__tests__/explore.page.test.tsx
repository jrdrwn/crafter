import { render, screen } from '@testing-library/react';

import ExplorePage from '../explore/page';

jest.mock('@/components/explore/persona-items', () => {
  return function MockPersonaItems() {
    return <div data-testid="persona-items">Persona Items Component</div>;
  };
});

jest.mock('@/components/explore/hero', () => {
  return function MockExploreHero() {
    return <div data-testid="explore-hero">Explore Hero</div>;
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

describe('Explore Page', () => {
  it('should render all components', () => {
    render(<ExplorePage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('explore-hero')).toBeInTheDocument();
    expect(screen.getByTestId('persona-items')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should be a function component', () => {
    expect(ExplorePage).toBeDefined();
    expect(typeof ExplorePage).toBe('function');
  });
});
