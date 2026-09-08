import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Alert - Alerta com ícone e fechamento opcional
 * @param {Object} props
 * @param {'info'|'success'|'warning'|'danger'} [props.variant='info']
 * @param {React.ReactNode} [props.title] - Título
 * @param {React.ReactNode} [props.children] - Conteúdo/descrição
 * @param {boolean} [props.dismissible=false] - Mostra X para fechar
 * @param {function} [props.onClose] - Callback ao fechar
 * @param {boolean} [props.defaultOpen=true] - Estado inicial
 * @param {string} [props.className]
 */
function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onClose,
  defaultOpen = true,
  className,
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (!open) return null;

  function handleClose() {
    setOpen(false);
    onClose?.();
  }

  const styles = {
    info: {
      container:
        "bg-brand-50 border-brand-200 text-brand-800",
      icon: "text-brand-500",
      close: "hover:bg-brand-100 text-brand-500 hover:text-brand-700",
    },
    success: {
      container:
        "bg-green-50 border-green-200 text-green-800",
      icon: "text-green-500",
      close: "hover:bg-green-100 text-green-500 hover:text-green-700",
    },
    warning: {
      container:
        "bg-amber-50 border-amber-200 text-amber-800",
      icon: "text-amber-500",
      close: "hover:bg-amber-100 text-amber-500 hover:text-amber-700",
    },
    danger: {
      container:
        "bg-red-50 border-red-200 text-red-800",
      icon: "text-red-500",
      close: "hover:bg-red-100 text-red-500 hover:text-red-700",
    },
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
  };

  const Icon = icons[variant];
  const s = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative rounded-lg border p-4 flex gap-3 animate-fade-in",
        s.container,
        className
      )}
    >
      <div className={cn("shrink-0 pt-0.5", s.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <h5 className="text-sm font-semibold mb-0.5 leading-none">
            {title}
          </h5>
        )}
        {children && (
          <div
            className={cn(
              "text-sm leading-relaxed",
              title ? "mt-1" : ""
            )}
          >
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar alerta"
          className={cn(
            "shrink-0 -mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            s.close
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
