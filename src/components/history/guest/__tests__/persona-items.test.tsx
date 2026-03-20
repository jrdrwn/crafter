import { render } from '@testing-library/react';
import PersonaItems from '../persona-items';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Guest PersonaItems', () => {
  it('renders guest persona items container', () => {
    const { container } = render(<PersonaItems />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
