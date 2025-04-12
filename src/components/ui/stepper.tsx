"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StepperProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function Stepper({
  currentStep,
  onStepChange,
  className,
  children,
}: StepperProps) {
  const steps = React.Children.toArray(children);
  const totalSteps = steps.length;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="relative flex items-center justify-between">
        {steps.map((_, index) => {
          const step = steps[index] as React.ReactElement<StepProps>;
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          const isClickable = onStepChange && (isCompleted || index === currentStep + 1);

          return (
            <React.Fragment key={index}>
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full border-2 w-10 h-10 text-sm font-medium",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                    ? "border-primary text-primary bg-primary/20"
                    : "border-muted-foreground/20 text-muted-foreground"
                )}
                onClick={() => {
                  if (isClickable) {
                    onStepChange?.(index);
                  }
                }}
                style={{
                  cursor: isClickable ? "pointer" : "default",
                }}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5",
                    (isCompleted || (currentStep === index + 1 && currentStep === index + 1))
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((_, index) => {
          const step = steps[index] as React.ReactElement<StepProps>;
          const isActive = currentStep === index;

          return (
            <div
              key={index}
              className={cn(
                "w-full transition-all duration-300",
        isActive ? "block" : "absolute opacity-0 pointer-events-none"
              )}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {step.props.title}
                </h3>
                {step.props.description && (
                  <p className="text-sm text-muted-foreground">
                    {step.props.description}
                  </p>
                )}
              </div>
              {step.props.children}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Step({ title, description, className, children }: StepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}
