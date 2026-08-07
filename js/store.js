import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { db } from "./firebase.js";
import { COLLECTIONS } from "./constants.js";
import { normalizeProductName } from "./helpers.js";

const productsRef = collection(db, COLLECTIONS.PRODUCTS);
const suggestionsRef = collection(db, COLLECTIONS.SUGGESTIONS);

// Escolta en temps real la llista compartida.
export function observeProducts(callback, onError) {
  const productsQuery = query(productsRef, orderBy("creatEl", "desc"));
  return onSnapshot(productsQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

// Els suggeriments també són compartits: si tota la família afegeix sovint llet,
// "Llet" acabarà apareixent entre els accessos ràpids de Supermercat.
export function observeSuggestions(callback, onError) {
  const suggestionsQuery = query(suggestionsRef, orderBy("vegades", "desc"));
  return onSnapshot(suggestionsQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function addProduct({ nom, categoria, user }) {
  const cleanName = nom.trim();
  const normalizedName = normalizeProductName(cleanName);
  const now = new Date();

  const dataCatalunya = new Intl.DateTimeFormat("ca-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(now);

  const horaCatalunya = new Intl.DateTimeFormat("ca-ES", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);

  const productPromise = addDoc(productsRef, {
    nom: cleanName,
    nomNormalitzat: normalizedName,
    categoria,
    afegitPerUid: user.uid,
    afegitPerNom: user.nom,
    afegitPerColor: user.color || "#275d43",
    data: dataCatalunya,
    hora: horaCatalunya,
    creatEl: serverTimestamp(),
    estat: "pendent",
    compratPerUid: null,
    compratPerNom: null,
    compratEl: null
  });

  // ID determinista per tenir un únic comptador per nom + categoria.
  const suggestionId = `${categoria}__${encodeURIComponent(normalizedName)}`;
  const suggestionPromise = setDoc(doc(db, COLLECTIONS.SUGGESTIONS, suggestionId), {
    nom: cleanName,
    nomNormalitzat: normalizedName,
    categoria,
    vegades: increment(1),
    ultimUs: serverTimestamp()
  }, { merge: true });

  await Promise.all([productPromise, suggestionPromise]);
}

export async function setProductBought(product, bought, user) {
  return updateDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), {
    estat: bought ? "comprat" : "pendent",
    compratPerUid: bought ? user.uid : null,
    compratPerNom: bought ? user.nom : null,
    compratEl: bought ? serverTimestamp() : null
  });
}

export async function updateProduct(productId, { nom, categoria }) {
  return updateDoc(doc(db, COLLECTIONS.PRODUCTS, productId), {
    nom: nom.trim(),
    nomNormalitzat: normalizeProductName(nom),
    categoria
  });
}

export async function deleteProduct(productId) {
  return deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
}

// Esborra NOMÉS els productes marcats. Els pendents es conserven.
export async function finishShopping() {
  const boughtQuery = query(productsRef, where("estat", "==", "comprat"));
  const snapshot = await getDocs(boughtQuery);
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => batch.delete(item.ref));
  await batch.commit();
  return snapshot.size;
}
