import { observeAuth, selectMember, clearSelectedMember } from "./auth.js";
import {
  addProduct,
  deleteProduct,
  finishShopping,
  observeProducts,
  observeSuggestions,
  setProductBought,
  updateProduct
} from "./store.js";
import { normalizeProductName, vibrate } from "./helpers.js";
import {
  elements,
  fillDeleteDialog,
  fillEditDialog,
  renderAddCategories,
  renderAllList,
  renderCategoryProducts,
  renderHome,
  renderMemberSelection,
  renderProfile,
  renderShoppingList,
  renderSupermarketSelection,
  showToast
} from "./ui.js";

let currentUser = null;
let products = [];
let suggestions = [];
let firebaseUid = null;
let stopProductsListener = null;
let stopSuggestionsListener = null;

// Navegació simple, sense router ni framework.
let route = { screen: "home", categoryId: null, shopFilter: "tota", shopStoreFilter: "tots" };

function navigate(screen, options = {}) {
  route = { ...route, screen, ...options };
  renderCurrentScreen();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCurrentScreen() {
  if (!currentUser || currentUser.needsMemberSelection) return;

  switch (route.screen) {
    case "home": return renderHome(products, currentUser);
    case "add-categories": return renderAddCategories(products, currentUser);
    case "supermarkets": return renderSupermarketSelection(products, currentUser);
    case "category": return renderCategoryProducts(route.categoryId, products, suggestions, currentUser);
    case "shopping-list": return renderShoppingList(route.shopFilter || "tota", route.shopStoreFilter || "tots", products, currentUser);
    case "all": return renderAllList(products, currentUser);
    case "profile": return renderProfile(currentUser);
    default: return renderHome(products, currentUser);
  }
}

observeAuth((user, authError) => {
  if (!user) {
    renderMemberSelection(authError || "");
    return;
  }

  firebaseUid = user.uid;

  if (user.needsMemberSelection) {
    currentUser = user;
    renderMemberSelection(authError || "");
    return;
  }

  currentUser = user;
  startRealtimeListeners();
  renderCurrentScreen();
});

function startRealtimeListeners() {
  if (!stopProductsListener) {
    stopProductsListener = observeProducts((newProducts) => {
      products = newProducts;
      renderCurrentScreen();
    }, handleSyncError);
  }

  if (!stopSuggestionsListener) {
    stopSuggestionsListener = observeSuggestions((newSuggestions) => {
      suggestions = newSuggestions;
      if (route.screen === "category") renderCurrentScreen();
    }, handleSyncError);
  }
}

function handleSyncError(error) {
  console.error(error);
  showToast("No s'ha pogut sincronitzar la llista.");
}

function hasDuplicate(name, categoryId, ignoreProductId = null) {
  const normalized = normalizeProductName(name);
  return products.some((p) =>
    p.id !== ignoreProductId &&
    p.categoria === categoryId &&
    p.estat === "pendent" &&
    normalizeProductName(p.nom) === normalized
  );
}

async function addProductFromName(name, categoryId) {
  const cleanName = name.trim();
  if (!cleanName) return;

  if (hasDuplicate(cleanName, categoryId)) {
    showToast(`“${cleanName}” ja és a la llista.`);
    return false;
  }

  await addProduct({ nom: cleanName, categoria: categoryId, user: currentUser });
  vibrate(22);
  showToast(`${cleanName} afegit.`);
  return true;
}

document.addEventListener("click", async (event) => {
  const memberButton = event.target.closest("[data-member-id]");
  if (memberButton) {
    const member = selectMember(memberButton.dataset.memberId);
    if (!member || !firebaseUid) return;
    currentUser = { uid: firebaseUid, ...member };
    route = { screen: "home", categoryId: null, shopFilter: "tota", shopStoreFilter: "tots" };
    startRealtimeListeners();
    renderCurrentScreen();
    showToast(`Hola, ${member.nom}!`);
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    const destination = routeButton.dataset.route;
    if (destination === "add") navigate("add-categories");
    if (destination === "shop") navigate("shopping-list", { shopFilter: "tota", shopStoreFilter: "tots" });
    if (destination === "all") navigate("all");
    return;
  }

  const leafCategoryButton = event.target.closest("[data-leaf-category]");
  if (leafCategoryButton) {
    navigate("category", { categoryId: leafCategoryButton.dataset.leafCategory });
    return;
  }

  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    const categoryId = categoryButton.dataset.category;
    if (categoryId === "supermercat") {
      navigate("supermarkets");
    } else {
      navigate("category", { categoryId });
    }
    return;
  }

  const filterButton = event.target.closest("[data-shop-filter]");
  if (filterButton) {
    route.shopFilter = filterButton.dataset.shopFilter;
    route.shopStoreFilter = "tots";
    renderCurrentScreen();
    return;
  }

  const storeFilterButton = event.target.closest("[data-store-filter]");
  if (storeFilterButton) {
    route.shopStoreFilter = storeFilterButton.dataset.storeFilter;
    renderCurrentScreen();
    return;
  }

  const suggestionButton = event.target.closest("[data-suggestion-name]");
  if (suggestionButton) {
    try {
      await addProductFromName(suggestionButton.dataset.suggestionName, route.categoryId);
    } catch (error) {
      console.error(error);
      showToast("No s'ha pogut afegir el producte.");
    }
    return;
  }

  const menuButton = event.target.closest("[data-product-menu]");
  if (menuButton) {
    const row = menuButton.closest("[data-product-id]");
    const product = products.find((p) => p.id === row?.dataset.productId);
    if (!product) return;
    fillEditDialog(product);
    elements.editDialog.showModal();
    return;
  }

  if (event.target.closest("#openDeleteFromEdit")) {
    const productId = elements.editDialog.querySelector("#editProductForm").dataset.productId;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    elements.editDialog.close();
    fillDeleteDialog(product);
    elements.deleteDialog.showModal();
    return;
  }

  if (event.target.closest("#finishShoppingButton")) {
    if (!products.some((p) => p.estat === "comprat")) return;
    elements.confirmDialog.showModal();
    return;
  }

  if (event.target.closest("#changeMemberButton")) {
    clearSelectedMember();
    currentUser = { uid: firebaseUid, needsMemberSelection: true };
    route = { screen: "home", categoryId: null, shopFilter: "tota", shopStoreFilter: "tots" };
    renderMemberSelection();
  }
});

document.addEventListener("submit", async (event) => {
  if (event.target.id === "quickAddForm") {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;

    try {
      const added = await addProductFromName(form.productName.value, route.categoryId);
      if (added) form.reset();
      form.productName.focus();
    } catch (error) {
      console.error(error);
      showToast("No s'ha pogut afegir el producte.");
    } finally {
      button.disabled = false;
    }
    return;
  }

  if (event.target.id === "editProductForm") {
    event.preventDefault();
    const form = event.target;
    const productId = form.dataset.productId;
    const nom = form.productName.value.trim();
    const categoria = form.productCategory.value;

    if (!nom) return;
    if (hasDuplicate(nom, categoria, productId)) {
      showToast(`“${nom}” ja és a la llista.`);
      return;
    }

    try {
      await updateProduct(productId, { nom, categoria });
      elements.editDialog.close();
      showToast("Producte actualitzat.");
    } catch (error) {
      console.error(error);
      showToast("No s'ha pogut editar el producte.");
    }
  }
});

document.addEventListener("change", async (event) => {
  if (!event.target.matches(".checkbox")) return;

  const row = event.target.closest("[data-product-id]");
  const product = products.find((item) => item.id === row?.dataset.productId);
  if (!product) return;

  try {
    await setProductBought(product, event.target.checked, currentUser);
    vibrate(event.target.checked ? 24 : 12);
  } catch (error) {
    console.error(error);
    event.target.checked = !event.target.checked;
    showToast("No s'ha pogut actualitzar el producte.");
  }
});

elements.confirmDialog.addEventListener("close", async () => {
  if (elements.confirmDialog.returnValue !== "confirm") return;
  try {
    const deleted = await finishShopping();
    vibrate(35);
    showToast(deleted ? `Compra finalitzada: ${deleted} ${deleted === 1 ? "producte eliminat" : "productes eliminats"}.` : "No hi havia cap producte marcat.");
  } catch (error) {
    console.error(error);
    showToast("No s'ha pogut finalitzar la compra.");
  }
});

elements.deleteDialog.addEventListener("close", async () => {
  if (elements.deleteDialog.returnValue !== "confirm") return;
  const productId = elements.deleteDialog.dataset.productId;
  if (!productId) return;

  try {
    await deleteProduct(productId);
    vibrate(18);
    showToast("Producte eliminat.");
  } catch (error) {
    console.error(error);
    showToast("No s'ha pogut eliminar el producte.");
  } finally {
    delete elements.deleteDialog.dataset.productId;
  }
});

elements.back.addEventListener("click", () => {
  switch (route.screen) {
    case "add-categories":
    case "shopping-list":
    case "all":
    case "profile":
      navigate("home");
      break;
    case "supermarkets":
      navigate("add-categories");
      break;
    case "category":
      if (["mercadona", "novavenda", "esclat", "supermercat"].includes(route.categoryId)) {
        navigate("supermarkets");
      } else {
        navigate("add-categories");
      }
      break;
    default:
      navigate("home");
  }
});

elements.profile.addEventListener("click", () => navigate("profile"));

// En desenvolupament local NO registrem el Service Worker. Així els canvis de
// JavaScript/CSS es veuen sempre sense problemes de memòria cau.
const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(location.hostname);
if ("serviceWorker" in navigator && !isLocalDevelopment) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.error("No s'ha pogut registrar el Service Worker:", error);
    });
  });
}
