import { render, screen } from '@testing-library/react';

import DomainCombobox from '../domain-combobox';

describe('Combobox Domain', () => {
  it('merender combobox domain', () => {
    render(<DomainCombobox value="" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });

  it('menampilkan nilai yang dipilih', () => {
    render(<DomainCombobox value="test-domain" onChangeAction={() => {}} />);
    const button = screen.getByRole('combobox');
    expect(button).toBeInTheDocument();
  });
});
