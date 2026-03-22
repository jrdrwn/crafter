import { render, screen } from '@testing-library/react';

import Hero from '../hero';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'history.hero-title': 'Your History',
      'history.hero-desc': 'View your created personas',
      'history.create': 'Create New',
    };
    return translations[key] || key;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Hero Riwayat Guest', () => {
  it('merender bagian hero', () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('merender tombol buat', () => {
    render(<Hero />);
    const createButton = screen.getByRole('link', { name: /create/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('href', '/create');
  });
});
