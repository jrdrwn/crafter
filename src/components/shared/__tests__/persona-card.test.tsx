import { render, screen } from '@testing-library/react';

import { PersonaCard } from '../persona-card';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('PersonaCard', () => {
  const defaultProps = {
    name: 'Test Persona',
    subtitle: 'Test Subtitle',
    quote: 'This is a test quote',
    tag: 'Marketing',
    date: '2024-01-01',
  };

  it('renders persona name', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Test Persona')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders quote when provided', () => {
    render(<PersonaCard {...defaultProps} />);
    // Quote is wrapped in curly quotes, search for the text content
    expect(screen.getByText(/This is a test quote/)).toBeInTheDocument();
  });

  it('renders tag when provided', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('renders date when provided', () => {
    render(<PersonaCard {...defaultProps} />);
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  it('renders "Created by Me" badge when createdByMe is true', () => {
    render(<PersonaCard {...defaultProps} createdByMe={true} />);
    expect(screen.getByText('Created by Me')).toBeInTheDocument();
  });

  it('does not render badge when createdByMe is false', () => {
    render(<PersonaCard {...defaultProps} createdByMe={false} />);
    expect(screen.queryByText('Created by Me')).not.toBeInTheDocument();
  });

  it('renders author name when provided', () => {
    render(<PersonaCard {...defaultProps} authorName="John Doe" />);
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
  });

  it('renders photo image when photoUrl is provided', () => {
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

  it('applies custom className', () => {
    const { container } = render(
      <PersonaCard {...defaultProps} className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders without optional props', () => {
    render(<PersonaCard name="Minimal Persona" />);
    expect(screen.getByText('Minimal Persona')).toBeInTheDocument();
  });
});
