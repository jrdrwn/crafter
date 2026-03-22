import { render, screen } from '@testing-library/react';

import Footer from '../footer';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'copyright': '© 2024 Crafter. All rights reserved.',
      'follow-us-on-instagram': 'Follow us on Instagram',
      'instagram': 'Instagram',
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

describe('Footer', () => {
  it('merender teks hak cipta', () => {
    render(<Footer />);
    expect(
      screen.getByText('© 2024 Crafter. All rights reserved.'),
    ).toBeInTheDocument();
  });

  it('merender tombol instagram', () => {
    render(<Footer />);
    expect(screen.getByText('Follow us on Instagram')).toBeInTheDocument();
  });

  it('merender link instagram dengan href yang benar', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /instagram/i });
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/crafter/');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
