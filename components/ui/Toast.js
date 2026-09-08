import React from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Toast - Notificação individual
 * @param {Object} props
 * @param {string} [props.title] - Título
 * @param {string} [props.description] - Descrição
 * @param {'success'|'error'|'warning'|'info'} [props.variant='info']
 * @param {number} [props.duration=4000]
 * @param {function} [props.onClose]
 * @param {boolean} [props.isClosing=false]
 */
function ToastIcon({ variant }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-brand-500" />,
  };
  return icons[variant] || icons.info;
}

function Toast({
  title,
  description,
  variant = "info",
  onClose,
  isClosing = false,
  className,
}) {
  const borderVariant = {
    success: "border-l-green-500",
    error: "border-l-red-500",
    warning: "border-l-amber-500",
    info: "border-l-brand-500",
  };

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 pr-10 shadow-lg shadow-slate-200/50 border-l-4",
        borderVariant[variant],
        isClosing ? "opacity-0 translate-y-2" : "animate-slide-up",
        className
      )}
      style={{ transition: "opacity 0.2s, transform 0.2s" }}
    >
      <div className="shrink-0 pt-0.5">
        <ToastIcon variant={variant} />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-slate-900 mb-0.5">
            {title}
          </h4>
        )}
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Toast;
