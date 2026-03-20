import { render } from '@testing-library/react';

import EditConstruct from '../construct';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/contexts/user-context', () => ({
  useUser: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
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
  id: 1,
  detail: 'Test detail',
  domain: { key: 'marketing', label: 'Marketing' },
  content_length_range: [100, 500],
  persona_attribute: [
    {
      attribute: {
        id: 1,
        layer: 'internal' as const,
        name: 'personality',
        title: 'Personality',
        description: 'Personality description',
      },
    },
  ],
  result: {
    full_name: 'Test Person',
    quote: 'Test quote',
    mixed: '<p>Mixed</p>',
    bullets: '<ul><li>Bullet</li></ul>',
    narative: '<p>Narrative</p>',
  },
  llm: { key: 'gemini', label: 'Gemini' },
  visibility: 'public' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
  useRAG: false,
  language: { key: 'en', label: 'English' },
};

describe('EditConstruct', () => {
  it('renders construct form with persona data', () => {
    const { container } = render(
      <EditConstruct personaId="1" persona={mockPersona} />,
    );
    expect(
      container.querySelector('form') ||
        container.querySelector('[class*="stepper"]'),
    ).toBeInTheDocument();
  });
});
