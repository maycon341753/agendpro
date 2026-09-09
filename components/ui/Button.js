import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Button - Botão reutilizável
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} [props.variant='primary'] - Variante visual
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Tamanho
 * @param {boolean} [props.disabled=false] - Desabilita o botão
 * @param {boolean} [props.loading=false] - Mostra spinner Loader2
 * @param {boolean} [props.asChild=false] - Se true, renderiza children (usar com Slot)
 * @param {React.ReactNode} [props.icon] - Ícone à esquerda
 * @param {React.ReactNode} [props.iconRight] - Ícone à direita
 * @param {string} [props.className] - Classes adicionais
 */
const Button = React.forwardRef(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    asChild = false,
    icon,
    iconRight,
    children,
    ...props
  },
  ref
) {
  function resolveIconNode(source, sizeClass) {
    if (source === null || source === undefined || source === false) return null;
    if (typeof source === "function") {
      const C = source;
      return <C className={sizeClass || "h-4 w-4"} />;
    }
    if (
      typeof source === "object" &&
      source !== null &&
      (source.$$typeof || React.isValidElement(source))
    ) {
      return source;
    }
    return null;
  }

  const base = {
    base:
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none",
    variants: {
      primary:
        "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
      ghost:
        "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
      outline:
        "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100",
    },
    sizes: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    },
  };

  const classes = cn(
    base.base,
    base.variants[variant],
    base.sizes[size],
    className
  );

  const leftIconNode = resolveIconNode(icon, "h-4 w-4");
  const rightIconNode = resolveIconNode(iconRight, "h-4 w-4");

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIconNode && <span className="inline-flex">{leftIconNode}</span>
      )}
      {children}
      {!loading && rightIconNode && (
        <span className="inline-flex">{rightIconNode}</span>
      )}
    </>
  );

  if (asChild) {
    return (
      <span ref={ref} className={classes}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
