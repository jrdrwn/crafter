import { render } from '@testing-library/react';
import Brand from '../brand';

describe('Brand', () => {
  it('renders brand svg', () => {
    const { container } = render(<Brand />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Brand className="custom-class" />);
    expect(container.querySelector('svg')).toHaveClass('custom-class');
  });

  it('renders with correct SVG attributes', () => {
    const { container } = render(<Brand />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    expect(svg).toHaveAttribute('width', '28');
    expect(svg).toHaveAttribute('height', '28');
  });
});
