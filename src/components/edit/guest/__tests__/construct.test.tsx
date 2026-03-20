import { act, render, waitFor } from '@testing-library/react';

import GuestEditConstruct from '../construct';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock @stepperize/react
jest.mock('@stepperize/react', () => ({
  defineStepper: () => ({
    useStepper: () => ({
      current: { id: 'domain', label: 'Domain' },
      isLast: false,
      isFirst: true,
      next: jest.fn(),
      prev: jest.fn(),
      goTo: jest.fn(),
      reset: jest.fn(),
      all: [
        { id: 'domain', label: 'Domain' },
        { id: 'internal', label: 'Internal Layer' },
        { id: 'external', label: 'External Layer' },
        { id: 'additional', label: 'Additional Settings' },
        { id: 'review', label: 'Review' },
      ],
    }),
    Scoped: ({ children }: { children: React.ReactNode }) => children,
    steps: [
      { id: 'domain', label: 'Domain' },
      { id: 'internal', label: 'Internal Layer' },
      { id: 'external', label: 'External Layer' },
      { id: 'additional', label: 'Additional Settings' },
      { id: 'review', label: 'Review' },
    ],
    utils: {
      getIndex: (id: string) => {
        const index = [
          'domain',
          'internal',
          'external',
          'additional',
          'review',
        ].indexOf(id);
        return index >= 0 ? index : 0;
      },
    },
  }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] }),
  }),
) as jest.Mock;

const mockPersona = {
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  request: {
    domain: { key: 'tech', label: 'Technology' },
    internal: [],
    external: [],
    contentLengthRange: [100, 500],
    llmModel: { key: 'gemini', label: 'Gemini' },
    language: { key: 'en', label: 'English' },
    useRAG: false,
    detail: '',
  },
  response: {},
};

describe('GuestEditConstruct', () => {
  it('renders guest edit construct form', () => {
    const { container } = render(<GuestEditConstruct persona={mockPersona} />);
    expect(
      container.querySelector('form') || container.querySelector('section'),
    ).toBeInTheDocument();
  });

  it('renders with null persona', () => {
    const { container } = render(<GuestEditConstruct persona={null} />);
    expect(
      container.querySelector('form') || container.querySelector('section'),
    ).toBeInTheDocument();
  });
});
