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
  { id: "anna", nom: "Anna", color: "#9B6BDF" },
  { id: "pau", nom: "Pau", color: "#3478F6" },
  { id: "mama", nom: "Mama", color: "#E46B8A" },
  { id: "papa", nom: "Papa", color: "#E28A35" }
];

export const COLLECTIONS = {
  PRODUCTS: "productes",
  SUGGESTIONS: "suggeriments"
};
