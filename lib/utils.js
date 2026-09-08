export function formatCurrency(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function formatDate(date, withWeekday = false) {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  if (withWeekday) {
    options.weekday = "short";
  }
  return d.toLocaleDateString("pt-BR", options);
}

export function formatTime(date) {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function generateSlug(str) {
  if (!str) return "";
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function cn(...classes) {
  return classes
    .flat()
    .filter((c) => typeof c === "string" && c.trim().length > 0)
    .join(" ")
    .trim();
}

export function formatPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

export function formatCPF(cpf) {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function toastSuccess(message) {
  if (typeof window !== "undefined") {
    showToast(message, "success");
  }
}

export function toastError(message) {
  if (typeof window !== "undefined") {
    showToast(message, "error");
  }
}

export function toastInfo(message) {
  if (typeof window !== "undefined") {
    showToast(message, "info");
  }
}

function showToast(message, type = "info") {
  const existingContainer = document.getElementById("toast-container");
  let container = existingContainer;
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.top = "1rem";
    container.style.right = "1rem";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "0.5rem";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
    warning: "bg-yellow-600",
  };
  toast.className = `${colors[type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium min-w-[280px] animate-slide-in`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      if (container && container.childNodes.length === 0 && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 300);
  }, 3500);
}

const utilsLib = {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  generateSlug,
  cn,
  formatPhone,
  formatCPF,
  toastSuccess,
  toastError,
  toastInfo,
};

export default utilsLib;
