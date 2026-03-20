import { render, screen } from '@testing-library/react';

import Home from '../page';

jest.mock('@/components/home/feature-revolutionize', () => {
  return function MockFeatureRevolutionize() {
    return <div data-testid="feature-revolutionize">Feature Revolutionize</div>;
  };
});

jest.mock('@/components/home/feature-why', () => {
  return function MockFeatureWhy() {
    return <div data-testid="feature-why">Feature Why</div>;
  };
});

jest.mock('@/components/home/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Section</div>;
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

describe('Home Page', () => {
  it('should render all components', () => {
    render(<Home />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('feature-why')).toBeInTheDocument();
    expect(screen.getByTestId('feature-revolutionize')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render components in correct order', () => {
    const { container } = render(<Home />);

    const sections = container.querySelectorAll('[data-testid]');
    const order = Array.from(sections).map((el) =>
      el.getAttribute('data-testid'),
    );

    expect(order).toEqual([
      'header',
      'hero',
      'feature-why',
      'feature-revolutionize',
      'end-cta',
      'footer',
    ]);
  });
});
