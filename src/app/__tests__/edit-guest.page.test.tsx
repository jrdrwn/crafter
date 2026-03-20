import { render, screen } from '@testing-library/react';

import GuestEditPage from '../edit/guest/page';

jest.mock('@/components/edit/guest/construct', () => {
  return function MockDesign({ persona }: { persona: unknown }) {
    return (
      <div data-testid="design">
        Design Component: {JSON.stringify(persona)}
      </div>
    );
  };
});

jest.mock('@/components/edit/shared/hero', () => {
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
  it('should render all components', () => {
    render(<GuestEditPage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
