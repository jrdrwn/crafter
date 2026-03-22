import { render, screen } from '@testing-library/react';

import EditPage from '../edit/[id]/page';

// Mock cookies before importing the page
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue({ value: 'test-token' }),
  }),
}));

// Mock global fetch
global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({
    data: { id: 'persona-123', name: 'Test Persona' },
  }),
}) as unknown as typeof fetch;

jest.mock('@/components/edit/construct', () => {
  return function MockDesign({
    persona,
    personaId,
  }: {
    persona: unknown;
    personaId: string;
  }) {
    return (
      <div data-testid="design">
        Design for {personaId}: {JSON.stringify(persona)}
      </div>
    );
  };
});

jest.mock('@/components/edit/shared/hero', () => {
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

describe('Halaman Edit', () => {
  const mockParams = { id: 'persona-123' };

  it('harus merender semua komponen dengan id yang benar', async () => {
    const PageComponent = await EditPage({
      params: Promise.resolve(mockParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('design')).toHaveTextContent('persona-123');
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus meneruskan prop id dan persona ke komponen Design', async () => {
    const PageComponent = await EditPage({
      params: Promise.resolve(mockParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('design')).toBeInTheDocument();
  });

  it('harus menangani id yang berbeda', async () => {
    const anotherParams = { id: 'persona-789' };
    const PageComponent = await EditPage({
      params: Promise.resolve(anotherParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('design')).toHaveTextContent('persona-789');
  });
});
