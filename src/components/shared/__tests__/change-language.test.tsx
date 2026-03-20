import { render, screen } from '@testing-library/react';
import ChangeLanguage from '../change-language';

describe('ChangeLanguage', () => {
  it('renders language selector', () => {
    render(<ChangeLanguage />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
