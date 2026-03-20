import { render, screen } from '@testing-library/react';
import { PersonasToolbar } from '../personas-toolbar';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('PersonasToolbar', () => {
  it('renders toolbar with search input', () => {
    render(
      <PersonasToolbar
        searchValue=""
        onSearchChangeAction={() => {}}
      />
    );
    const searchInput = document.querySelector('input[type="search"]');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders toolbar with domain filter', () => {
    render(
      <PersonasToolbar
        searchValue=""
        onSearchChangeAction={() => {}}
        domainValue="test"
        onDomainChangeAction={() => {}}
      />
    );
    expect(document.querySelector('[role="combobox"]') || document.querySelector('button')).toBeInTheDocument();
  });
});
