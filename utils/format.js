export function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function formatCurrencyBRL(value) {
  return formatCurrency(value);
}

export function formatNumber(value, decimals = 0) {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDateBR(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTimeBR(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const datePart = formatDateBR(d);
  const timePart = formatTime(d);
  return `${datePart} ${timePart}`;
}

export function formatTime(dateOrTimeStr) {
  if (!dateOrTimeStr) return "";
  if (typeof dateOrTimeStr === "string" && /^\d{2}:\d{2}/.test(dateOrTimeStr)) {
    return dateOrTimeStr.slice(0, 5);
  }
  const d = dateOrTimeStr instanceof Date ? dateOrTimeStr : new Date(dateOrTimeStr);
  if (isNaN(d.getTime())) return "";
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatCPF(cpf) {
  const digits = String(cpf || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj) {
  const digits = String(cnpj || "").replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, "$1.$2");
  if (digits.length <= 8) return digits.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (digits.length <= 12) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function formatCEP(cep) {
  const digits = String(cep || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/(\d{5})(\d{1,3})/, "$1-$2");
}

export function generateSlug(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default {
  formatCurrency,
  formatCurrencyBRL,
  formatNumber,
  formatDateBR,
  formatDateTimeBR,
  formatTime,
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  generateSlug,
};
