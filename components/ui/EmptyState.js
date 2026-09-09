import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";

/**
 * EmptyState - Estado vazio centralizado com ícone grande
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Ícone Lucide (default FolderOpen)
 * @param {string} props.title - Título principal
 * @param {string} [props.description] - Descrição secundária
 * @param {{label: string, onClick: function, variant?: string, icon?: React.ReactNode}} [props.action] - Botão ação opcional
 * @param {string} [props.className] - Classes adicionais
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  function resolveIconNode(source, fallbackNode) {
    if (source === null || source === undefined || source === false) {
      return fallbackNode;
    }
    if (typeof source === "function") {
      const C = source;
      return <C className="h-8 w-8 text-slate-400" strokeWidth={1.5} />;
    }
    if (
      typeof source === "object" &&
      source !== null &&
      (source.$$typeof || React.isValidElement(source))
    ) {
      return source;
    }
    return fallbackNode;
  }

  const iconNode = resolveIconNode(icon, (
    <FolderOpen className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
  ));

  const actionIconNode = action
    ? resolveIconNode(action.icon, null)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 ring-8 ring-slate-50">
        {iconNode}
      </div>
      {title && (
        <h3 className="text-base font-semibold text-slate-900 mb-1.5">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || "primary"}
          onClick={action.onClick}
          icon={actionIconNode}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
