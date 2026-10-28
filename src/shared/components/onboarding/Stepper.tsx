import React from 'react';
import { CheckIcon } from '../Icons';

interface StepperProps {
  steps: { id: number; name: string }[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            {step.id < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full" style={{ backgroundColor: 'var(--primary-color)' }} />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--primary-color)' }}>
                  <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </>
            ) : step.id === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-800"
                  style={{ borderColor: 'var(--primary-color)' }}
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }} aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                   <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
              </>
            )}
            <p className={`absolute -bottom-6 text-xs text-center w-max -translate-x-1/2 left-1/2 ${step.id === currentStep ? 'font-bold' : 'text-gray-500'}`} style={step.id === currentStep ? { color: 'var(--primary-color)' } : {}}>{step.name}</p>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Stepper;
