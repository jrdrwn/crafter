import { render, screen } from '@testing-library/react';

import ChangeLanguage from '../change-language';

describe('Ubah Bahasa', () => {
  it('merender pemilih bahasa', () => {
    render(<ChangeLanguage />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
