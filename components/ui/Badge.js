import React from "react";
import { cn } from "@/utils/cn";

/**
 * Badge - Distintivo inline
 * @param {Object} props
 * @param {'default'|'success'|'warning'|'danger'|'info'|'muted'} [props.variant='default']
 * @param {string} [props.className]
 */
function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    info: "bg-brand-50 text-brand-700 border border-brand-200",
    muted: "bg-slate-50 text-slate-500 border border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export default Badge;
