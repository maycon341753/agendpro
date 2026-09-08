import React from "react";
import { cn } from "@/utils/cn";

/**
 * Dropdown - Menu dropdown (controlled ou não)
 * @param {Object} props
 * @param {boolean} [props.open] - Controlado
 * @param {function} [props.onOpenChange] - Callback
 * @param {'start'|'end'} [props.align='end'] - Alinhamento
 */
const DropdownContext = React.createContext(null);

function DropdownMenu({
  children,
  open,
  onOpenChange,
  align = "end",
  className,
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const ref = React.useRef(null);

  function setOpen(val) {
    if (!isControlled) setInternalOpen(val);
    onOpenChange?.(val);
  }

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setOpen, align }}>
      <div ref={ref} className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownTrigger({ children, asChild, className }) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx)
    throw new Error("DropdownTrigger deve ser usado dentro de <DropdownMenu>");

  const handleClick = (e) => {
    ctx.setOpen(!ctx.isOpen);
    if (asChild && children?.props?.onClick) children.props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      "aria-expanded": ctx.isOpen,
      "aria-haspopup": "true",
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={ctx.isOpen}
      aria-haspopup="true"
      className={cn(className)}
    >
      {children}
    </button>
  );
}

function DropdownContent({ className, children, ...props }) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx)
    throw new Error("DropdownContent deve ser usado dentro de <DropdownMenu>");

  if (!ctx.isOpen) return null;

  const alignClasses = {
    start: "left-0",
    end: "right-0",
  };

  return (
    <div
      role="menu"
      className={cn(
        "absolute z-50 top-full mt-2 min-w-[12rem] rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 animate-scale-in origin-top",
        alignClasses[ctx.align],
        className
      )}
      onClick={() => ctx.setOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownItem({ className, children, disabled = false, onClick, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
      }}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50 text-left",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownSeparator({ className }) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-slate-200", className)}
    />
  );
}

export {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
};
export default DropdownMenu;
