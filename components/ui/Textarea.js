import React from "react";
import { cn } from "@/utils/cn";

/**
 * Textarea - Área de texto
 * @param {Object} props
 * @param {string} [props.label] - Rótulo acima
 * @param {string} [props.error] - Mensagem de erro
 * @param {string} [props.helperText] - Texto auxiliar
 * @param {number} [props.rows=4] - Número de linhas
 * @param {boolean} [props.required=false] - Mostra *
 * @param {string} [props.className] - Classes adicionais
 */
const Textarea = React.forwardRef(function Textarea(
  {
    className,
    label,
    error,
    helperText,
    rows = 4,
    required = false,
    id,
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          "input flex w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors resize-y",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-slate-300 hover:border-slate-400 focus-visible:border-brand-500",
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1.5" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-slate-500 text-xs mt-1.5">{helperText}</p>
      )}
    </div>
  );
});

export default Textarea;
