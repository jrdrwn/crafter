import { render } from '@testing-library/react';
import { HeroSidesDecorator } from '../hero-sides-decorator';

describe('HeroSidesDecorator', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeroSidesDecorator />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
