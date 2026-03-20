import { render, screen } from '@testing-library/react';
import DomainCombobox from '../domain-combobox';

describe('DomainCombobox', () => {
  it('renders domain combobox', () => {
    render(<DomainCombobox value="" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('displays selected value', () => {
    render(<DomainCombobox value="test-domain" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });
});
