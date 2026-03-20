import { render, screen } from '@testing-library/react';

import DetailPage from './page';

jest.mock('@/components/detail/detail', () => {
  return function MockDetail({ id }: { id: string }) {
    return <div data-testid="detail">Detail for {id}</div>;
  };
});

jest.mock('@/components/detail/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Detail Hero</div>;
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

describe('Detail Page', () => {
  const mockParams = { id: 'persona-123' };

  it('should render all components with correct id', async () => {
    const PageComponent = await DetailPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('detail')).toHaveTextContent('persona-123');
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should pass id prop to Detail component', async () => {
    const PageComponent = await DetailPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByTestId('detail')).toBeInTheDocument();
  });

  it('should handle different ids', async () => {
    const anotherParams = { id: 'persona-456' };
    const PageComponent = await DetailPage({ params: Promise.resolve(anotherParams) });
    render(PageComponent);

    expect(screen.getByTestId('detail')).toHaveTextContent('persona-456');
  });
});
