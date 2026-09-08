import React from "react";
import { cn } from "@/utils/cn";

/**
 * Input - Campo de entrada
 * @param {Object} props
 * @param {string} [props.label] - Rótulo acima
 * @param {string} [props.error] - Mensagem de erro
 * @param {string} [props.helperText] - Texto auxiliar
 * @param {React.ReactNode} [props.leftIcon] - Ícone à esquerda
 * @param {React.ReactNode} [props.rightIcon] - Ícone à direita
 * @param {string} [props.type='text'] - Tipo nativo
 * @param {boolean} [props.required=false] - Mostra *
 * @param {string} [props.className] - Classes adicionais
 */
const Input = React.forwardRef(function Input(
  {
    className,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    type = "text",
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
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "input flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-0 transition-colors",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-300 hover:border-slate-400 focus-visible:border-brand-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-500 text-xs mt-1.5"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-slate-500 text-xs mt-1.5">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
