import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

const STEP_LABELS = [
  "Serviço",
  "Profissional",
  "Data",
  "Horário",
  "Seus Dados",
  "Resumo",
];

function StepsProgress({ currentStep, className }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full mx-10" />
        <div
          className="absolute top-5 left-0 h-1 rounded-full transition-all duration-500 ease-out mx-10"
          style={{
            width: `calc(${((currentStep - 1) / (STEP_LABELS.length - 1)) * 100}% - 5rem)`,
            backgroundColor: "var(--brand-color, #ec4899)",
          }}
        />
        {STEP_LABELS.map((label, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                  isCompleted
                    ? "border-transparent text-white"
                    : isCurrent
                      ? "border-transparent text-white shadow-lg scale-110"
                      : "border-slate-300 bg-white text-slate-400"
                )}
                style={
                  isCompleted || isCurrent
                    ? { backgroundColor: "var(--brand-color, #ec4899)" }
                    : {}
                }
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isCurrent
                    ? "text-slate-900"
                    : isCompleted
                      ? "text-slate-600"
                      : "text-slate-400"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">
            Etapa {currentStep} de {STEP_LABELS.length}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--brand-color, #ec4899)" }}
          >
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(currentStep / STEP_LABELS.length) * 100}%`,
              backgroundColor: "var(--brand-color, #ec4899)",
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {STEP_LABELS.map((_, index) => {
            const step = index + 1;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300",
                  isCompleted
                    ? "border-transparent text-white"
                    : isCurrent
                      ? "border-transparent text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-400"
                )}
                style={
                  isCompleted || isCurrent
                    ? { backgroundColor: "var(--brand-color, #ec4899)" }
                    : {}
                }
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span>{step}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StepsProgress;
