import { render } from '@testing-library/react';

import { HeroSidesDecorator } from '../hero-sides-decorator';

describe('Hero Sides Decorator', () => {
  it('merender tanpa crash', () => {
    const { container } = render(<HeroSidesDecorator />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
