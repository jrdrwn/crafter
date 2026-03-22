import { render, screen } from '@testing-library/react';

import { PersonaCard } from '../persona-card';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Kartu Persona', () => {
  const defaultProps = {
    name: 'Test Persona',
    subtitle: 'Test Subtitle',
    quote: 'This is a test quote',
    tag: 'Marketing',
    date: '2024-01-01',
  };

  it('merender nama persona', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('merender subtitle saat disediakan', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('merender quote saat disediakan', () => {
    render(<PersonaCard {...defaultProps} />);
    // Quote is wrapped in curly quotes, search for the text content
    expect(screen.getByText(/This is a test quote/)).toBeInTheDocument();
  });

  it('merender tag saat disediakan', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('merender tanggal saat disediakan', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('merender badge "Dibuat oleh Saya" saat createdByMe true', () => {
    render(<PersonaCard {...defaultProps} createdByMe={true} />);
    expect(screen.getByText('Created by Me')).toBeInTheDocument();
  });

  it('tidak merender badge saat createdByMe false', () => {
    render(<PersonaCard {...defaultProps} createdByMe={false} />);
    expect(screen.queryByText('Created by Me')).not.toBeInTheDocument();
  });

  it('merender nama penulis saat disediakan', () => {
    render(<PersonaCard {...defaultProps} authorName="John Doe" />);
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
  });

  it('merender gambar foto saat photoUrl disediakan', () => {
    render(
      <PersonaCard
        {...defaultProps}
        photoUrl="https://example.com/photo.jpg"
      />,
    );
    const img = screen.getByAltText("Test Persona's photo");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('menerapkan className kustom', () => {
    const { container } = render(
      <PersonaCard {...defaultProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('merender tanpa prop opsional', () => {
    render(<PersonaCard name="Minimal Persona" />);
    expect(screen.getByText('Minimal Persona')).toBeInTheDocument();
  });
});
