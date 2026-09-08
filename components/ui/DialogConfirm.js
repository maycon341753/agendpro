import React from "react";
import { cn } from "@/utils/cn";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

/**
 * DialogConfirm - Diálogo de confirmação para ações destrutivas
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function(boolean): void} props.onOpenChange
 * @param {string} props.title - Título
 * @param {string} props.description - Mensagem
 * @param {string} [props.confirmText='Excluir']
 * @param {string} [props.cancelText='Cancelar']
 * @param {'danger'|'primary'|'secondary'} [props.variant='danger']
 * @param {function} props.onConfirm - Callback de confirmação
 * @param {boolean} [props.loading=false] - Loading no botão confirmar
 */
function DialogConfirm({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Excluir",
  cancelText = "Cancelar",
  variant = "danger",
  onConfirm,
  loading = false,
  className,
}) {
  function handleCancel() {
    onOpenChange?.(false);
  }

  function handleConfirm() {
    onConfirm?.();
    if (!loading) onOpenChange?.(false);
  }

  const confirmVariant = variant === "danger" ? "danger" : variant;

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      size="sm"
      className={className}
    >
      <ModalHeader showClose={false}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
              variant === "danger"
                ? "bg-red-50 text-red-600"
                : "bg-brand-50 text-brand-600"
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 pt-1">
            <ModalTitle>{title}</ModalTitle>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DialogConfirm;
