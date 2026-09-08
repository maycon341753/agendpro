import { useToast as originalUseToast, Toaster } from "@/components/ui/Toaster";

/**
 * useToast - Hook público para disparar notificações toast
 * @example
 *   const { toast } = useToast();
 *   toast({ title: "Sucesso!", variant: "success" });
 *   toast({ title: "Erro", description: "Falha ao salvar.", variant: "error" });
 * @returns {{
 *   toast: (opts: {title?: string, description?: string, variant?: 'success'|'error'|'warning'|'info', duration?: number}) => number,
 *   dismiss: (id: number) => void,
 *   toasts: Array
 * }}
 */
export function useToast() {
  return originalUseToast();
}

export { Toaster };
export default useToast;
