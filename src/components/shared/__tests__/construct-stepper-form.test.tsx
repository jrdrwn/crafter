import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import { ConstructStepperForm } from '../construct-stepper-form';

// Mock untuk ConstructStepperForm
const steps = [
  { id: 'step1', label: 'Step 1' },
  { id: 'step2', label: 'Step 2' },
  { id: 'step3', label: 'Step 3' },
];

function StepperFormWrapper() {
  const form = useForm({
    defaultValues: {
      domain: { key: '', label: '' },
      internal: [],
      external: [],
      contentLengthRange: [100, 200],
      llmModel: { key: '', label: '' },
      language: { key: '', label: '' },
      useRAG: false,
      detail: '',
    },
  });

  return (
    <ConstructStepperForm
      steps={steps}
      currentIndex={0}
      isLast={false}
      isFirst={true}
      goTo={() => {}}
      next={() => {}}
      prev={() => {}}
      stepFields={{}}
      form={form}
      renderStep={() => <div>Step Content</div>}
      onSubmit={() => {}}
      loading={false}
    />
  );
}

describe('Form Stepper Konstruksi', () => {
  it('merender formulir stepper', () => {
    render(<StepperFormWrapper />);
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('merender navigasi stepper', () => {
    render(<StepperFormWrapper />);
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  it('merender tombol langkah', () => {
    render(<StepperFormWrapper />);
    // Step buttons have role="tab", navigation buttons have role="button"
    const stepButtons = screen.getAllByRole('tab');
    const navButtons = screen.getAllByRole('button');
    expect(stepButtons.length).toBe(3); // 3 step buttons
    expect(navButtons.length).toBeGreaterThanOrEqual(2); // Back and Next buttons
  });
});
