import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorMessageButtonRetry } from '../error-retry';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  RefreshCcw: () => <span data-testid="refresh-icon">RefreshIcon</span>,
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    variant,
    size,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe('ErrorMessageButtonRetry', () => {
  it('should render error message correctly', () => {
    const onRetry = jest.fn();

    render(
      <ErrorMessageButtonRetry
        message="Something went wrong"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render retry button with correct text and icon', () => {
    const onRetry = jest.fn();

    render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();

    render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByTestId('button'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should apply correct button variant and size', () => {
    const onRetry = jest.fn();

    render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toHaveAttribute('data-size', 'sm');
  });

  it('should apply default className to container', () => {
    const onRetry = jest.fn();

    const { container } = render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('mx-auto', 'mb-2', 'flex', 'flex-col', 'items-center', 'gap-2');
  });

  it('should apply custom className when provided', () => {
    const onRetry = jest.fn();

    const { container } = render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
        className="custom-class"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('mx-auto', 'mb-2', 'flex', 'flex-col', 'items-center', 'gap-2', 'custom-class');
  });

  it('should apply error message styling', () => {
    const onRetry = jest.fn();

    render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    const errorMessage = screen.getByText('Error occurred');
    expect(errorMessage).toHaveClass('text-xs', 'text-destructive');
  });

  it('should handle multiple clicks on retry button', async () => {
    const onRetry = jest.fn();
    const user = userEvent.setup();

    render(
      <ErrorMessageButtonRetry
        message="Error occurred"
        onRetry={onRetry}
      />
    );

    const button = screen.getByTestId('button');
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(onRetry).toHaveBeenCalledTimes(3);
  });

  it('should render with empty message', () => {
    const onRetry = jest.fn();

    render(
      <ErrorMessageButtonRetry
        message=""
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });
});
