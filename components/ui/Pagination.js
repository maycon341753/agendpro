import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

/**
 * Pagination - Paginação
 * @param {Object} props
 * @param {number} props.page - Página atual (1-based)
 * @param {number} props.pageSize - Itens por página
 * @param {number} props.totalCount - Total de itens
 * @param {function(number): void} props.onPageChange - Callback com nova página
 * @param {number} [props.siblingCount=1] - Páginas irmãs mostradas
 * @param {string} [props.className]
 */
function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  siblingCount = 1,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  function getRange() {
    const totalNumbers = siblingCount * 2 + 5;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const firstPage = 1;
    const lastPage = totalPages;

    const items = [];
    items.push(firstPage);

    if (showLeftDots) items.push("left-dots");

    const start = showLeftDots ? leftSibling : 2;
    const end = showRightDots ? rightSibling : totalPages - 1;
    for (let i = start; i <= end; i++) items.push(i);

    if (showRightDots) items.push("right-dots");

    if (lastPage !== firstPage) items.push(lastPage);

    return items;
  }

  const pages = getRange();

  return (
    <nav
      role="navigation"
      aria-label="Paginação"
      className={cn(
        "flex items-center justify-between gap-2 flex-wrap",
        className
      )}
    >
      <div className="text-sm text-slate-500 hidden sm:block">
        Mostrando{" "}
        <span className="font-medium text-slate-700">
          {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </span>{" "}
        a{" "}
        <span className="font-medium text-slate-700">
          {Math.min(currentPage * pageSize, totalCount)}
        </span>{" "}
        de{" "}
        <span className="font-medium text-slate-700">{totalCount}</span>{" "}
        resultados
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirst}
          onClick={() => onPageChange?.(currentPage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (p === "left-dots" || p === "right-dots") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="inline-flex h-9 w-9 items-center justify-center text-slate-400"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange?.(p)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 px-3 items-center justify-center rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isLast}
          onClick={() => onPageChange?.(currentPage + 1)}
          aria-label="Próxima página"
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

export default Pagination;
