import { CATEGORIES, FAMILY_MEMBERS, PRODUCT_CATEGORIES, SUPERMARKETS } from "./constants.js";
import {
  categoryById,
  escapeHtml,
  formatProductDate,
  initials,
  productBelongsToCategory
} from "./helpers.js";

export const elements = {
  main: document.querySelector("#mainContent"),
  title: document.querySelector("#pageTitle"),
  back: document.querySelector("#backButton"),
  profile: document.querySelector("#profileButton"),
  toast: document.querySelector("#toast"),
  confirmDialog: document.querySelector("#confirmDialog"),
  editDialog: document.querySelector("#editDialog"),
  deleteDialog: document.querySelector("#deleteDialog")
};

let toastTimer;

export function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

export function setHeader({ title, showBack = false, user = null }) {
  elements.title.textContent = title;
  elements.back.classList.toggle("hidden", !showBack);

  if (user) {
    elements.profile.classList.remove("hidden");
    elements.profile.innerHTML = `<span class="avatar-initials">${escapeHtml(initials(user.nom))}</span><span class="avatar-name">${escapeHtml(user.nom)}</span>`;
    elements.profile.style.setProperty("--avatar-color", user.color || "#275d43");
    elements.profile.setAttribute("aria-label", `Usuari actual: ${user.nom}. Canviar d’usuari`);
  } else {
    elements.profile.classList.add("hidden");
  }
}

export function renderMemberSelection(errorMessage = "") {
  setHeader({ title: "Llista de la compra" });
  elements.main.innerHTML = `
    <section class="login-wrap">
      <div class="login-card login-card-simple">
        <span class="login-kicker">NFCasa</span>
        <h2>Qui ets?</h2>
        <p>Només ho hauràs de triar la primera vegada en aquest dispositiu.</p>
        <div class="member-grid">
          ${FAMILY_MEMBERS.map((member) => `
            <button class="member-button" type="button" data-member-id="${member.id}">
              <span class="member-avatar" style="--member-color:${member.color}">${initials(member.nom)}</span>
              <strong>${escapeHtml(member.nom)}</strong>
            </button>
          `).join("")}
        </div>
        ${errorMessage ? `<p class="error-text">${escapeHtml(errorMessage)}</p>` : ""}
      </div>
    </section>`;
}

function countPendingForTopCategory(products, categoryId) {
  return products.filter((p) => p.estat === "pendent" && productBelongsToCategory(p, categoryId)).length;
}

export function renderHome(products, user) {
  const pending = products.filter((p) => p.estat === "pendent");
  setHeader({ title: "Llista de la compra", user });

  elements.main.innerHTML = `
    <section class="hero home-hero">
      <span class="welcome-chip">Hola, ${escapeHtml(user.nom)} 👋</span>
      <h2>${pending.length ? `${pending.length} ${pending.length === 1 ? "producte pendent" : "productes pendents"}` : "La llista està al dia"}</h2>
      <p>${pending.length ? "Això és el que falta ara mateix a casa." : "No hi ha res pendent. Quan falti alguna cosa, apunta-la aquí."}</p>
    </section>

    ${pending.length ? `<section class="summary-grid summary-grid-five">
      ${CATEGORIES.map((category) => {
        const count = countPendingForTopCategory(products, category.id);
        return `<div class="summary-card"><span>${category.icona}</span><strong>${count}</strong><small>${category.nom}</small></div>`;
      }).join("")}
    </section>` : ""}

    <section class="action-grid home-grid">
      ${homeAction("add", "➕", "Afegir productes", "Apunta ràpidament el que falta")}
      ${homeAction("shop", "🛒", "Fer la compra", pending.length ? `${pending.length} productes per revisar` : "La llista està buida")}
      ${homeAction("all", "📋", "Veure tota la llista", "Consulta-ho tot per categories")}
    </section>`;
}

function homeAction(route, emoji, title, subtitle) {
  return `<button class="home-action" data-route="${route}" type="button">
    <span class="emoji">${emoji}</span>
    <span class="home-action-copy"><strong>${title}</strong><small>${subtitle}</small></span>
    <span class="chevron">›</span>
  </button>`;
}

export function renderAddCategories(products, user) {
  setHeader({ title: "Afegir productes", showBack: true, user });
  elements.main.innerHTML = `
    <section class="section-header">
      <div><h2>On falta?</h2><p>Tria on vols apuntar el producte.</p></div>
    </section>
    <section class="category-grid category-grid-five">
      ${CATEGORIES.map((category) => {
        const count = countPendingForTopCategory(products, category.id);
        return `<button class="category-card" data-category="${category.id}" type="button">
          <span class="category-icon">${category.icona}</span>
          <strong>${category.nom}</strong>
          <span>${count} ${count === 1 ? "pendent" : "pendents"}</span>
          ${category.id === "supermercat" ? `<small class="category-hint">Mercadona · Novavenda · Esclat</small>` : ""}
        </button>`;
      }).join("")}
    </section>`;
}

export function renderSupermarketSelection(products, user) {
  setHeader({ title: "Supermercat", showBack: true, user });
  const legacyItems = products.filter((p) => p.categoria === "supermercat" && p.estat === "pendent");

  elements.main.innerHTML = `
    <section class="section-header">
      <div><h2>🛒 Quin supermercat?</h2><p>Tria la botiga on vols afegir els productes.</p></div>
    </section>
    <section class="category-grid supermarket-grid">
      ${SUPERMARKETS.map((store) => {
        const count = products.filter((p) => p.categoria === store.id && p.estat === "pendent").length;
        return `<button class="category-card supermarket-card ${store.colorClass || ""}" data-category="${store.id}" type="button">
          <span class="store-dot" aria-hidden="true"></span>
          <strong>${store.nom}</strong>
          <span>${count} ${count === 1 ? "pendent" : "pendents"}</span>
        </button>`;
      }).join("")}
    </section>
    ${legacyItems.length ? `
      <button class="legacy-supermarket-link" type="button" data-leaf-category="supermercat">
        Veure ${legacyItems.length} ${legacyItems.length === 1 ? "producte antic sense botiga assignada" : "productes antics sense botiga assignada"}
      </button>` : ""}`;
}

export function renderCategoryProducts(categoryId, products, suggestions, user) {
  const category = categoryById(categoryId) || { id: categoryId, nom: "Supermercat", icona: "🛒" };
  const items = products.filter((p) => p.categoria === categoryId);
  const categorySuggestions = suggestions
    .filter((s) => s.categoria === categoryId)
    .filter((s) => !items.some((p) => p.nomNormalitzat === s.nomNormalitzat && p.estat === "pendent"))
    .slice(0, 6);

  setHeader({ title: category.nom, showBack: true, user });
  elements.main.innerHTML = `
    <section class="section-header compact-header">
      <div><h2>${category.icona || "🛒"} ${category.nom}</h2><p>${items.filter((p) => p.estat === "pendent").length} pendents</p></div>
    </section>

    <section class="quick-add-card">
      <form id="quickAddForm" class="quick-add-form" autocomplete="off">
        <input id="productName" name="productName" type="text" maxlength="80" required placeholder="Què falta?" aria-label="Nom del producte" />
        <button class="quick-add-button" type="submit" aria-label="Afegir producte">+</button>
      </form>
      ${categorySuggestions.length ? `
        <div class="suggestions-wrap">
          <span class="suggestions-label">Freqüents</span>
          <div class="suggestion-chips">
            ${categorySuggestions.map((s) => `<button class="suggestion-chip" type="button" data-suggestion-name="${escapeHtml(s.nom)}">+ ${escapeHtml(s.nom)}</button>`).join("")}
          </div>
        </div>` : ""}
    </section>

    ${items.length ? `<section class="list-stack product-management-list">${items.map(managementProductCard).join("")}</section>` : emptyState("Encara no hi ha cap producte en aquesta categoria.")}`;

  requestAnimationFrame(() => document.querySelector("#productName")?.focus());
}

function managementProductCard(product) {
  return `<article class="product-card ${product.estat === "comprat" ? "bought-soft" : ""}" data-product-id="${product.id}">
    <div class="product-main">
      <p class="product-name">${escapeHtml(product.nom)}</p>
      <div class="product-meta">
        <span class="user-chip"><span class="user-dot" style="--user-color:${escapeHtml(product.afegitPerColor || "#275d43")}"></span>${escapeHtml(product.afegitPerNom || "Usuari")}</span>
        <span>${escapeHtml(formatProductDate(product))}</span>
        ${product.estat === "comprat" ? "<span>✓ Ja està marcat</span>" : ""}
      </div>
    </div>
    <button class="more-button" type="button" data-product-menu aria-label="Editar o eliminar ${escapeHtml(product.nom)}">•••</button>
  </article>`;
}

export function renderShoppingList(filterId, storeFilterId, products, user) {
  let filtered;
  if (filterId === "tota") {
    filtered = products;
  } else if (filterId === "supermercat") {
    filtered = products.filter((p) => productBelongsToCategory(p, "supermercat"));
    if (storeFilterId && storeFilterId !== "tots") {
      filtered = filtered.filter((p) => p.categoria === storeFilterId);
    }
  } else {
    filtered = products.filter((p) => p.categoria === filterId);
  }

  const pending = filtered.filter((p) => p.estat === "pendent");
  const bought = filtered.filter((p) => p.estat === "comprat");
  const totalBought = products.filter((p) => p.estat === "comprat").length;

  setHeader({ title: "Fer la compra", showBack: true, user });

  elements.main.innerHTML = `
    <section class="shopping-sticky-head">
      <div class="shopping-progress">
        <div><strong>${pending.length}</strong><span>pendents</span></div>
        <div class="progress-divider"></div>
        <div><strong>${bought.length}</strong><span>marcats</span></div>
      </div>
      <div class="filter-strip" role="group" aria-label="Filtrar per categoria">
        ${filterChip("tota", "🧺", "Tot", filterId)}
        ${CATEGORIES.map((c) => filterChip(c.id, c.icona, c.nom, filterId)).join("")}
      </div>
      ${filterId === "supermercat" ? `
        <div class="filter-strip store-filter-strip" role="group" aria-label="Filtrar per supermercat">
          ${storeFilterChip("tots", "Tots", storeFilterId)}
          ${SUPERMARKETS.map((store) => storeFilterChip(store.id, store.nom, storeFilterId)).join("")}
        </div>` : ""}
    </section>

    ${filtered.length ? `
      ${pending.length ? `<section class="shopping-section"><p class="shopping-section-title">Encara falta</p><div class="list-stack">${pending.map(shoppingRow).join("")}</div></section>` : ""}
      ${bought.length ? `<section class="shopping-section bought-section"><p class="shopping-section-title">Ja ho tens</p><div class="list-stack">${bought.map(shoppingRow).join("")}</div></section>` : ""}
    ` : emptyState("No hi ha cap producte en aquest filtre.")}

    <div class="bottom-action shopping-bottom">
      <button id="finishShoppingButton" class="button button-primary" type="button" ${totalBought === 0 ? "disabled" : ""}>
        ✅ Finalitzar compra${totalBought ? ` · ${totalBought}` : ""}
      </button>
    </div>`;
}

function filterChip(id, icon, label, current) {
  return `<button class="filter-chip ${id === current ? "active" : ""}" type="button" data-shop-filter="${id}">${icon} ${escapeHtml(label)}</button>`;
}

function storeFilterChip(id, label, current) {
  const store = SUPERMARKETS.find((item) => item.id === id);
  const storeClass = store?.colorClass || "";
  return `<button class="filter-chip store-filter-chip ${storeClass} ${id === current ? "active" : ""}" type="button" data-store-filter="${id}">${id !== "tots" ? '<span class="store-dot" aria-hidden="true"></span>' : ''}${escapeHtml(label)}</button>`;
}

function shoppingRow(product) {
  const bought = product.estat === "comprat";
  const category = categoryById(product.categoria) || { icona: "🛒", nom: "Supermercat" };
  return `<label class="product-card buy-row ${bought ? "bought" : ""}" data-product-id="${product.id}">
    <input class="checkbox" type="checkbox" ${bought ? "checked" : ""} />
    <div class="product-main">
      <p class="product-name">${escapeHtml(product.nom)}</p>
      <div class="product-meta">
        <span>${category.icona || "•"} ${escapeHtml(category.nom)}</span>
        ${bought && product.compratPerNom ? `<span>Marcat per ${escapeHtml(product.compratPerNom)}</span>` : `<span>Afegit per ${escapeHtml(product.afegitPerNom || "Usuari")}</span>`}
      </div>
    </div>
  </label>`;
}

export function renderAllList(products, user) {
  setHeader({ title: "Tota la llista", showBack: true, user });
  const pending = products.filter((product) => product.estat === "pendent");

  elements.main.innerHTML = `
    <section class="section-header"><div><h2>Tot el que falta</h2><p>${pending.length} ${pending.length === 1 ? "producte pendent" : "productes pendents"}</p></div></section>
    ${CATEGORIES.map((category) => {
      if (category.id === "supermercat") {
        return renderSupermarketAllSection(pending);
      }
      const items = pending.filter((product) => product.categoria === category.id);
      return standardAllSection(category, items);
    }).join("")}`;
}

function standardAllSection(category, items) {
  return `<section class="full-list-section ${items.length ? "" : "empty-category-section"}">
    <div class="full-list-title"><h3>${category.icona} ${category.nom}</h3><span class="count-badge">${items.length}</span></div>
    ${items.length ? `<ul class="simple-list">${items.map(simpleListItem).join("")}</ul>` : `<p class="empty-category-text">Cap producte pendent</p>`}
  </section>`;
}

function renderSupermarketAllSection(pending) {
  const allSupermarket = pending.filter((product) => productBelongsToCategory(product, "supermercat"));
  const legacy = pending.filter((product) => product.categoria === "supermercat");

  return `<section class="full-list-section supermarket-full-section ${allSupermarket.length ? "" : "empty-category-section"}">
    <div class="full-list-title"><h3>🛒 Supermercat</h3><span class="count-badge">${allSupermarket.length}</span></div>
    ${allSupermarket.length ? `
      <div class="supermarket-groups">
        ${SUPERMARKETS.map((store) => {
          const items = pending.filter((product) => product.categoria === store.id);
          if (!items.length) return "";
          return `<div class="supermarket-subsection compact-store-row ${store.colorClass || ""}">
            <div class="supermarket-subtitle">
              <span><i class="store-dot" aria-hidden="true"></i>${store.nom}</span>
              <small>${items.length}</small>
            </div>
            <ul class="simple-list supermarket-simple-list">${items.map(simpleListItem).join("")}</ul>
          </div>`;
        }).join("")}
        ${legacy.length ? `<div class="supermarket-subsection legacy-subsection">
          <div class="supermarket-subtitle"><span>🛒 Sense botiga assignada</span><small>${legacy.length}</small></div>
          <ul class="simple-list">${legacy.map(simpleListItem).join("")}</ul>
        </div>` : ""}
      </div>` : `<p class="empty-category-text">Cap producte pendent</p>`}
  </section>`;
}

function simpleListItem(item) {
  return `<li><span>${escapeHtml(item.nom)}</span><small>${escapeHtml(item.afegitPerNom || "")}</small></li>`;
}

export function renderProfile(user) {
  setHeader({ title: "Usuari", showBack: true, user });
  elements.main.innerHTML = `
    <section class="profile-card">
      <div class="profile-line">
        <div class="profile-avatar" style="background:${escapeHtml(user.color || "#275d43")}">${escapeHtml(initials(user.nom))}</div>
        <div><h2>${escapeHtml(user.nom)}</h2><p>Aquest dispositiu està identificat com a ${escapeHtml(user.nom)}.</p></div>
      </div>
      <button id="changeMemberButton" class="button button-secondary full-width" type="button">Canviar d’usuari</button>
    </section>`;
}

export function fillEditDialog(product) {
  const form = elements.editDialog.querySelector("#editProductForm");
  form.dataset.productId = product.id;
  form.productName.value = product.nom;

  const normalOptions = PRODUCT_CATEGORIES
    .filter((category) => !category.parentId)
    .map((category) => `<option value="${category.id}" ${category.id === product.categoria ? "selected" : ""}>${category.nom}</option>`)
    .join("");

  const supermarketOptions = SUPERMARKETS
    .map((store) => `<option value="${store.id}" ${store.id === product.categoria ? "selected" : ""}>${store.nom}</option>`)
    .join("");

  const legacyOption = product.categoria === "supermercat"
    ? `<option value="supermercat" selected>Supermercat (sense botiga)</option>`
    : "";

  form.productCategory.innerHTML = `
    ${normalOptions}
    <optgroup label="Supermercat">${supermarketOptions}${legacyOption}</optgroup>`;
}

export function fillDeleteDialog(product) {
  elements.deleteDialog.dataset.productId = product.id;
  elements.deleteDialog.querySelector("#deleteProductName").textContent = product.nom;
}

function emptyState(message) {
  return `<div class="empty-state"><span class="empty-icon">📝</span><strong>Tot al dia</strong><span>${escapeHtml(message)}</span></div>`;
}
