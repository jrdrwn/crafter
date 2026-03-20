import { render, screen } from '@testing-library/react';

import FeatureRevolutionize from '../feature-revolutionize';

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Revolutionize Your Workflow',
      'desc': 'Create personas in minutes',
      'points.0': 'Point 1',
      'points.1': 'Point 2',
      'points.2': 'Point 3',
      'points.3': 'Point 4',
      'points.4': 'Point 5',
      'cta': 'Get Started',
      'persona.name': 'John Doe',
      'persona.role': 'Developer',
      'persona.quote': 'Great tool!',
      'persona.motivation': 'High',
      'persona.pain': 'Low',
      'persona.skill': 'Expert',
      'motivation': 'Motivation',
      'pain': 'Pain',
      'skill': 'Skill',
    };
    return translations[key] || key;
  },
}));

describe('FeatureRevolutionize', () => {
  it('renders feature section with title', () => {
    render(<FeatureRevolutionize />);
    expect(screen.getByText('Revolutionize Your Workflow')).toBeInTheDocument();
  });

  it('renders feature description', () => {
    render(<FeatureRevolutionize />);
    expect(screen.getByText('Create personas in minutes')).toBeInTheDocument();
  });
});
