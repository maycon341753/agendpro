import React from "react";
import { cn } from "@/utils/cn";

/**
 * Tabs - Abas com state interno ou controlado
 * @param {Object} props
 * @param {string} [props.value] - Valor controlado
 * @param {function} [props.onValueChange] - Callback ao mudar aba
 * @param {string} [props.defaultValue] - Valor inicial (uncontrolled)
 */
const TabsContext = React.createContext(null);

function Tabs({
  children,
  value,
  onValueChange,
  defaultValue = "",
  className,
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  function handleChange(val) {
    if (!isControlled) setInternalValue(val);
    onValueChange?.(val);
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center justify-center gap-2 border-b border-slate-200 p-1 w-full overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function TabsTrigger({
  value,
  className,
  children,
  disabled = false,
  ...props
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger deve ser usado dentro de <Tabs>");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && ctx.onChange(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "text-brand-600"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
      )}
    </button>
  );
}

function TabsContent({ value, className, children, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent deve ser usado dentro de <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none animate-fade-in", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
