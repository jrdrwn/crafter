import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Fragment, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { TCreateForm } from '../create/construct';

interface Step {
  id: string;
  label: string;
}

interface ConstructStepperFormProps {
  steps: Step[];
  currentIndex: number;
  isLast: boolean;
  isFirst: boolean;
  goTo: (id: string) => void; // Accepts string or union type from stepper
  next: () => void;
  prev: () => void;
  stepFields: Record<string, string[]>;
  form: UseFormReturn<TCreateForm>; // react-hook-form instance
  renderStep: (stepId: string) => React.ReactNode;
  onSubmit: (data: TCreateForm) => void;
  loading: boolean;
  submitLabel?: string;
  submitIcon?: React.ReactNode;
  loadingLabel?: string;
  loadingIcon?: React.ReactNode;
  agreementText?: React.ReactNode;
}

export function ConstructStepperForm({
  steps,
  currentIndex,
  isLast,
  isFirst,
  goTo,
  next,
  prev,
  stepFields,
  form,
  renderStep,
  onSubmit,
  loading,
  submitLabel = 'Submit',
  submitIcon,
  loadingLabel = 'Submitting... ',
  loadingIcon,
  agreementText,
}: ConstructStepperFormProps) {
  const formSectionRef = useRef<HTMLDivElement>(null);

  const handleNext = async () => {
    const currentId = steps[currentIndex].id;
    const fields = stepFields[currentId] || [];
    const ok = fields.length
      ? await form.trigger(fields as Parameters<typeof form.trigger>[0], {
          shouldFocus: true,
        })
      : true;
    if (ok) {
      next();
      if (formSectionRef.current) {
        formSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const handlePrev = () => {
    prev();
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section ref={formSectionRef} className="p-2 py-8 sm:p-4 sm:py-12 lg:py-16">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto flex flex-col gap-6"
      >
        {/* Stepper Navigation */}
        <nav aria-label="Steps" className="group my-2">
          <ol className="flex items-center justify-between gap-2">
            {steps.map((s, idx, arr) => (
              <Fragment key={s.id}>
                <li className="flex shrink-0 flex-col items-center gap-1 sm:gap-2 md:gap-3 lg:flex-row">
                  <Button
                    type="button"
                    role="tab"
                    variant={idx <= currentIndex ? 'default' : 'secondary'}
                    aria-current={
                      steps[currentIndex].id === s.id ? 'step' : undefined
                    }
                    aria-posinset={idx + 1}
                    aria-setsize={steps.length}
                    aria-selected={steps[currentIndex].id === s.id}
                    className="flex size-8 items-center justify-center rounded-full sm:size-10"
                    onClick={async () => {
                      if (idx <= currentIndex) {
                        goTo(s.id);
                        return;
                      }
                      if (idx - currentIndex > 1) return;
                      const fields = stepFields[steps[currentIndex].id] || [];
                      const valid = fields.length
                        ? await form.trigger(
                            fields as Parameters<typeof form.trigger>[0],
                            { shouldFocus: true },
                          )
                        : true;
                      if (!valid) return;
                      goTo(s.id);
                    }}
                  >
                    {idx + 1}
                  </Button>
                  <span className="hidden text-sm font-medium sm:inline">
                    {s.label}
                  </span>
                </li>
                {idx < arr.length - 1 && (
                  <Separator
                    className={`${idx < currentIndex ? 'bg-primary' : 'bg-muted'} flex-1`}
                  />
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        <div className="mt-6">{renderStep(steps[currentIndex].id)}</div>

        {/* Controls */}
        <div
          className={cn(
            'mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center',
            isLast ? 'sm:justify-between' : 'sm:justify-end',
          )}
        >
          {isLast ? (
            <>
              {agreementText && (
                <p className="order-2 text-xs text-muted-foreground sm:order-1">
                  {agreementText}
                </p>
              )}
              <div className="order-1 flex flex-col-reverse items-stretch gap-4 sm:order-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrev}
                  disabled={isFirst}
                  className="w-full sm:w-auto"
                >
                  Back
                </Button>
                <Button
                  className={cn(
                    'w-full sm:w-48',
                    loading && 'cursor-not-allowed',
                  )}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      {loadingIcon} {loadingLabel}
                    </>
                  ) : (
                    <>
                      {submitIcon} {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrev}
                disabled={isFirst}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </form>
    </section>
  );
}
