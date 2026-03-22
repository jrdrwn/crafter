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

describe('Item Persona Guest', () => {
  it('merender container item persona guest', () => {
    const { container } = render(<PersonaItems />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
