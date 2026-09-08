import React from "react";
import { cn } from "@/utils/cn";

/**
 * Skeleton - Base shimmer (retângulo animado)
 * @param {Object} props
 * @param {string} [props.className] - Classes adicionais (largura/altura)
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-slate-200 rounded-md animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200",
        className
      )}
      style={{ backgroundSize: "1000px 100%" }}
      {...props}
    />
  );
}

/**
 * SkeletonText - Linhas de texto simuladas
 * @param {number} [props.lines=3] - Quantidade de linhas
 */
function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonCard - Card padrão com avatar, título e linhas
 */
function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-slate-200 shadow-sm p-6",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * SkeletonTable - Tabela simulada com linhas
 * @param {number} [rows=5]
 * @param {number} [cols=4]
 */
function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1 max-w-[12rem]" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn(
                  "h-4 flex-1 max-w-[12rem]",
                  c === 0 && "w-16 max-w-[4rem] rounded-full"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable };
export default Skeleton;
