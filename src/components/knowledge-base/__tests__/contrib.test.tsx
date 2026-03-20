import { render } from '@testing-library/react';
import Contrib from '../contrib';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: null,
    loading: false,
  }),
}));

describe('Contrib', () => {
  it('renders contribution form card', () => {
    const { container } = render(<Contrib />);
    expect(container.querySelector('form') || container.querySelector('section')).toBeInTheDocument();
  });
});
