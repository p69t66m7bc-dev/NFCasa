// Categories principals que es mostren a la pantalla d'afegir productes.
export const SUPERMARKETS = [
  { id: "mercadona", nom: "Mercadona", icona: "", parentId: "supermercat", colorClass: "store-mercadona" },
  { id: "novavenda", nom: "Novavenda", icona: "", parentId: "supermercat", colorClass: "store-novavenda" },
  { id: "esclat", nom: "Esclat", icona: "", parentId: "supermercat", colorClass: "store-esclat" }
];

export const CATEGORIES = [
  { id: "carnisseria", nom: "Carnisseria", icona: "🥩" },
  { id: "peixateria", nom: "Peixateria", icona: "🐟" },
  { id: "farmacia", nom: "Farmàcia", icona: "💊" },
  { id: "xinos", nom: "Xinos", icona: "🏪" },
  { id: "supermercat", nom: "Supermercat", icona: "🛒", children: SUPERMARKETS.map((store) => store.id) }
];

// Categories reals on es poden guardar productes nous.
export const PRODUCT_CATEGORIES = [
  ...CATEGORIES.filter((category) => category.id !== "supermercat"),
  ...SUPERMARKETS
];

export const FAMILY_MEMBERS = [
  { id: "anna", nom: "Anna", color: "#ed69b0ff" },
  { id: "pau", nom: "Pau", color: "#4de3a7ff" },
  { id: "mama", nom: "Mama", color: "#e4a36bff" },
  { id: "papa", nom: "Papa", color: "#3c87e9ff" }
];

export const COLLECTIONS = {
  PRODUCTS: "productes",
  SUGGESTIONS: "suggeriments"
};
