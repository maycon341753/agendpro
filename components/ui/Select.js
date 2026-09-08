import React from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

/**
 * Select - Select nativo estilizado
 * @param {Object} props
 * @param {string} [props.label] - Rótulo
 * @param {Array<{label: string, value: string, disabled?: boolean}>} [props.options=[]] - Opções
 * @param {string} [props.placeholder] - Placeholder (option disabled
 * @param {string} [props.error] - Mensagem erro
 * @param {string} [props.className] - Classes adicionais
 */
const Select = React.forwardRef(function Select(
  {
    className,
    label,
    options = [],
    placeholder,
    error,
    id,
    required = false,
    ...props
  },
  ref
) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "input flex h-10 w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-300 hover:border-slate-400 focus-visible:border-brand-500",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
            >
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
