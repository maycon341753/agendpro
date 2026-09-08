import React from "react";
import { cn } from "@/utils/cn";

/**
 * Table - Tabela estilizada com subcomponentes
 * @param {Object} props
 * @param {boolean} [props.zebra=false] - Linhas zebradas
 * @param {React.ReactNode} [props.emptyState] - Conteúdo customizado para dados vazios
 * @param {boolean} [props.hasData=true] - Se false, mostra empty state
 * @param {number} [props.colSpan=10] - Colspan para empty state
 */
const Table = React.forwardRef(function Table(
  { className, zebra = false, emptyState, hasData = true, colSpan = 10, children, ...props },
  ref
) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(
          "w-full border-collapse text-sm",
          zebra && "[&_tbody_tr:nth-child(even)]:bg-slate-50/50",
          className
        )}
        {...props}
      >
        {children}
      </table>
      {!hasData && (
        <tbody>
          <tr>
            <td colSpan={colSpan}>{emptyState || <TableEmptyState />}</td>
          </tr>
        </tbody>
      )}
    </div>
  );
});

function TableEmptyState() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg
          className="h-6 w-6 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Nenhum registro encontrado
      </h3>
      <p className="text-sm text-slate-500">
        Tente ajustar os filtros ou adicionar novos dados.
      </p>
    </div>
  );
}

const TableHeader = React.forwardRef(function TableHeader(
  { className, ...props },
  ref
) {
  return (
    <thead
      ref={ref}
      className={cn("bg-slate-50/50", className)}
      {...props}
    />
  );
});

const TableBody = React.forwardRef(function TableBody(
  { className, ...props },
  ref
) {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
});

const TableFooter = React.forwardRef(function TableFooter(
  { className, ...props },
  ref
) {
  return (
    <tfoot
      ref={ref}
      className={cn(
        "bg-slate-50/50 font-medium text-slate-900 border-t border-slate-200",
        className
      )}
      {...props}
    />
  );
});

const TableRow = React.forwardRef(function TableRow(
  { className, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b border-slate-200 transition-colors hover:bg-slate-50/50",
        className
      )}
      {...props}
    />
  );
});

const TableHead = React.forwardRef(function TableHead(
  { className, ...props },
  ref
) {
  return (
    <th
      ref={ref}
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-slate-600 text-xs uppercase tracking-wider",
        className
      )}
      {...props}
    />
  );
});

const TableCell = React.forwardRef(function TableCell(
  { className, ...props },
  ref
) {
  return (
    <td
      ref={ref}
      className={cn(
        "px-4 py-3 align-middle text-slate-700",
        className
      )}
      {...props}
    />
  );
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
};
export default Table;
