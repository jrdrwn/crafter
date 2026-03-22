import { render, screen } from '@testing-library/react';

import DetailPage from '../detail/[id]/page';

jest.mock('@/components/detail/persona-detail', () => {
  return function MockPersonaDetail({ personaId }: { personaId: string }) {
    return <div data-testid="persona-detail">Detail for {personaId}</div>;
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

describe('Halaman Detail', () => {
  const mockParams = { id: 'persona-123' };

  it('harus merender semua komponen dengan id yang benar', async () => {
    const PageComponent = await DetailPage({
      params: Promise.resolve(mockParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('persona-detail')).toHaveTextContent(
      'persona-123',
    );
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus meneruskan prop id ke komponen PersonaDetail', async () => {
    const PageComponent = await DetailPage({
      params: Promise.resolve(mockParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('persona-detail')).toBeInTheDocument();
  });

  it('harus menangani id yang berbeda', async () => {
    const anotherParams = { id: 'persona-456' };
    const PageComponent = await DetailPage({
      params: Promise.resolve(anotherParams),
    });
    render(PageComponent);

    expect(screen.getByTestId('persona-detail')).toHaveTextContent(
      'persona-456',
    );
  });
});
