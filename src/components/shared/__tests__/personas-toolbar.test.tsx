import { render, screen } from '@testing-library/react';

import { PersonasToolbar } from '../personas-toolbar';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('Toolbar Persona', () => {
  it('merender toolbar dengan input pencarian', () => {
    render(<PersonasToolbar searchValue="" onSearchChangeAction={() => {}} />);
    const searchInput = document.querySelector('input[type="search"]');
    expect(searchInput).toBeInTheDocument();
  });

  it('merender toolbar dengan filter domain', () => {
    render(
      <PersonasToolbar
        searchValue=""
        onSearchChangeAction={() => {}}
        domainValue="test"
        onDomainChangeAction={() => {}}
      />,
    );
    expect(
      document.querySelector('[role="combobox"]') ||
        document.querySelector('button'),
    ).toBeInTheDocument();
  });
});
