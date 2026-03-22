import { render, screen } from '@testing-library/react';

import KnowledgeBasePage from '../knowledge-base/page';

jest.mock('@/components/knowledge-base/contrib', () => {
  return function MockContrib() {
    return <div data-testid="contrib">Contrib Component</div>;
  };
});

jest.mock('@/components/knowledge-base/contrib-list', () => {
  return function MockContribList() {
    return <div data-testid="contrib-list">Contrib List</div>;
  };
});

jest.mock('@/components/knowledge-base/hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Knowledge Base Hero</div>;
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

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs">{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-trigger">{children}</div>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-content">{children}</div>
  ),
}));

describe('Halaman Basis Pengetahuan', () => {
  it('harus merender semua komponen', () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('end-cta')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('harus merender tab dengan contrib dan contrib-list', () => {
    render(<KnowledgeBasePage />);

    expect(screen.getByTestId('contrib')).toBeInTheDocument();
    expect(screen.getByTestId('contrib-list')).toBeInTheDocument();
  });

  it('harus berupa komponen fungsi', () => {
    expect(KnowledgeBasePage).toBeDefined();
    expect(typeof KnowledgeBasePage).toBe('function');
  });
});
