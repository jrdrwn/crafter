import { render, screen } from '@testing-library/react';

import CreatePage from './page';

jest.mock('@/components/create/construct', () => {
  return function MockDesign() {
    return <div data-testid="design">Design Component</div>;
  };
});

jest.mock('@/components/create/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Create Hero</div>;
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

describe('Create Page', () => {
  it('should render all components', async () => {
    const PageComponent = await CreatePage();
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('design')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should be an async component', () => {
    expect(CreatePage).toBeDefined();
    expect(typeof CreatePage).toBe('function');
  });
});
