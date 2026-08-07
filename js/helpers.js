import { CATEGORIES, SUPERMARKETS } from "./constants.js";

export function categoryById(id) {
  return [...CATEGORIES, ...SUPERMARKETS].find((category) => category.id === id);
}

export function isSupermarketCategory(id) {
  return id === "supermercat" || SUPERMARKETS.some((store) => store.id === id);
}

// Permet tractar "Supermercat" com un grup que inclou Mercadona, Novavenda i Esclat.
// També mantenim compatibilitat amb productes antics que tinguessin categoria "supermercat".
export function productBelongsToCategory(product, categoryId) {
  if (categoryId === "supermercat") {
    return isSupermarketCategory(product.categoria);
  }
  return product.categoria === categoryId;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

// Normalització usada per detectar duplicats encara que canviïn majúscules,
// accents o espais: "Llet", " llet " i "LLET" es consideren el mateix.
export function normalizeProductName(value = "") {
  return value
    .trim()
    .toLocaleLowerCase("ca")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function formatProductDate(product) {
  if (product.creatEl?.toDate) {
    const date = product.creatEl.toDate();
    const data = new Intl.DateTimeFormat("ca-ES", {
      timeZone: "Europe/Madrid",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
    const hora = new Intl.DateTimeFormat("ca-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);
    return `${data} · ${hora}`;
  }

  if (product.data && product.hora) return `${product.data} · ${product.hora}`;
  return "Ara mateix";
}

export function vibrate(duration = 18) {
  if (navigator.vibrate) navigator.vibrate(duration);
}
