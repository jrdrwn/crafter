import { render, screen } from '@testing-library/react';

import EditPage from './page';

jest.mock('@/components/edit/edit', () => {
  return function MockEdit({ id }: { id: string }) {
    return <div data-testid="edit">Edit for {id}</div>;
  };
});

jest.mock('@/components/edit/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Edit Hero</div>;
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

describe('Edit Page', () => {
  const mockParams = { id: 'persona-123' };

  it('should render all components with correct id', async () => {
    const PageComponent = await EditPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('edit')).toHaveTextContent('persona-123');
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should pass id prop to Edit component', async () => {
    const PageComponent = await EditPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByTestId('edit')).toBeInTheDocument();
  });

  it('should handle different ids', async () => {
    const anotherParams = { id: 'persona-789' };
    const PageComponent = await EditPage({ params: Promise.resolve(anotherParams) });
    render(PageComponent);

    expect(screen.getByTestId('edit')).toHaveTextContent('persona-789');
  });
});
