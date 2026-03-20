import { render, screen } from '@testing-library/react';

import GuestEditPage from './page';

jest.mock('@/components/edit/edit-guest', () => {
  return function MockEditGuest() {
    return <div data-testid="edit-guest">Edit Guest Component</div>;
  };
});

jest.mock('@/components/edit/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Edit Guest Hero</div>;
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

describe('Guest Edit Page', () => {
  it('should render all components', async () => {
    const PageComponent = await GuestEditPage();
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('edit-guest')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should be an async component', () => {
    expect(GuestEditPage).toBeDefined();
    expect(typeof GuestEditPage).toBe('function');
  });
});
