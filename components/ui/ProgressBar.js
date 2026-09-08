import React from "react";
import { cn } from "@/utils/cn";

/**
 * ProgressBar - Barra de progresso
 * @param {Object} props
 * @param {number} [props.value=0] - 0..100
 * @param {'brand'|'success'|'warning'|'danger'} [props.color='brand']
 * @param {boolean} [props.showLabel=false] - Mostra % interna
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
function ProgressBar({
  value = 0,
  color = "brand",
  showLabel = false,
  size = "md",
  className,
}) {
  const clamped = Math.max(0, Math.min(100, value));

  const colors = {
    brand: "bg-brand-600",
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 text-white font-medium",
            colors[color],
            !showLabel && "pr-0"
          )}
          style={{ width: `${clamped}%` }}
        >
          {showLabel && clamped >= 8 && (
            <span className={cn(labelSizes[size])}>{Math.round(clamped)}%</span>
          )}
        </div>
      </div>
      {showLabel && clamped < 8 && (
        <div className={cn("text-slate-500 mt-1", labelSizes[size])}>
          {Math.round(clamped)}%
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
