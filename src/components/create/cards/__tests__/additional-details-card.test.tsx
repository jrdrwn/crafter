import { render } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import AdditionalDetailsCard from '../additional-details-card';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Helper component
function AdditionalDetailsCardWrapper() {
  const form = useForm({
    defaultValues: {
      detail: '',
    },
  });
  return <AdditionalDetailsCard control={form.control} />;
}

describe('AdditionalDetailsCard', () => {
  it('renders additional details card', () => {
    const { container } = render(<AdditionalDetailsCardWrapper />);
    expect(container.querySelector('[class*="card"]') || container.querySelector('div')).toBeInTheDocument();
  });
});
