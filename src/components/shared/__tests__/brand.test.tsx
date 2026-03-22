import { render } from '@testing-library/react';

import Brand from '../brand';

describe('Brand', () => {
  it('merender svg brand', () => {
    const { container } = render(<Brand />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('menerapkan className kustom', () => {
    const { container } = render(<Brand className="custom-class" />);
    expect(container.querySelector('svg')).toHaveClass('custom-class');
  });

  it('merender dengan atribut SVG yang benar', () => {
    const { container } = render(<Brand />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });
});
