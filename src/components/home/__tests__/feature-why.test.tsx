import { render, screen } from '@testing-library/react';

import FeatureWhy from '../feature-why';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Why Choose Us',
      'desc': 'The best tool for persona creation',
      'ai.title': 'AI Powered',
      'ai.desc': 'AI description',
      'taxonomy.title': 'Taxonomy',
      'taxonomy.desc': 'Taxonomy description',
      'multi.title': 'Multi User',
      'multi.desc': 'Multi user description',
    };
    return translations[key] || key;
  },
}));

describe('Fitur Mengapa', () => {
  it('merender bagian mengapa dengan judul', () => {
    render(<FeatureWhy />);
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
  });

  it('merender deskripsi mengapa', () => {
    render(<FeatureWhy />);
    expect(
      screen.getByText('The best tool for persona creation'),
    ).toBeInTheDocument();
  });
});
