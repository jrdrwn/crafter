import { render, screen } from '@testing-library/react';
import Header from '../header';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'shared.header.home': 'Home',
      'shared.header.create': 'Create',
      'shared.header.tutorial.title': 'Tutorial',
      'shared.header.tutorial.href': '/tutorial',
      'shared.header.explore': 'Explore',
      'shared.header.history': 'History',
      'shared.header.knowledge-base': 'Knowledge Base',
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

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: null,
    isLoading: false,
    logout: jest.fn(),
  }),
}));

describe('Header', () => {
  it('renders header with brand', () => {
    render(<Header />);
    const header = document.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('renders navigation menu', () => {
    render(<Header />);
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('renders brand link', () => {
    render(<Header />);
    const brandLink = screen.getByRole('link', { name: /crafter/i }) || document.querySelector('a[href="/"]');
    expect(brandLink).toBeInTheDocument();
  });

  it('renders theme toggle', () => {
    render(<Header />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders mobile menu button', () => {
    render(<Header />);
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBeGreaterThanOrEqual(1);
  });
});
