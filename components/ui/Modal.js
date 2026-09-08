import React from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Modal - Modal com overlay e transições
 * @param {Object} props
 * @param {boolean} props.open - Se o modal está aberto
 * @param {function} props.onClose - Callback ao fechar
 * @param {string} [props.size='md'] - Tamanho: sm | md | lg | xl
 * @param {boolean} [props.closeOnEsc=true] - Fechar com ESC
 * @param {boolean} [props.closeOnOverlay=true] - Fechar clicando fora
 */
const ModalContext = React.createContext(null);

function Modal({
  open,
  onClose,
  size = "md",
  closeOnEsc = true,
  closeOnOverlay = true,
  children,
  className,
}) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  React.useEffect(() => {
    if (!open || !closeOnEsc) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, closeOnEsc, onClose]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        aria-hidden={!open}
        role="dialog"
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          className
        )}
      >
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
          onClick={() => closeOnOverlay && onClose?.()}
        />
        <div
          className={cn(
            "relative w-full bg-white rounded-xl shadow-xl animate-scale-in",
            sizes[size]
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

/**
 * ModalHeader
 * @param {boolean} [props.showClose=true] - Mostra botão X
 */
function ModalHeader({ className, children, showClose = true, ...props }) {
  const ctx = React.useContext(ModalContext);
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 pb-4 border-b border-slate-200",
        className
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {showClose && (
        <button
          type="button"
          onClick={ctx?.onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors -mr-2 -mt-2"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ModalTitle({ className, ...props }) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-slate-900",
        className
      )}
      {...props}
    />
  );
}

function ModalBody({ className, ...props }) {
  return (
    <div
      className={cn("p-6 pt-4 text-sm text-slate-600 leading-relaxed", className)}
      {...props}
    />
  );
}

function ModalFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 p-6 pt-4 border-t border-slate-200",
        className
      )}
      {...props}
    />
  );
}

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle };
export default Modal;
