import {
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { FAMILY_MEMBERS } from "./constants.js";

const MEMBER_STORAGE_KEY = "nfcasa-member-id";

// Firebase crea una sessió anònima per darrere.
// L'usuari no veu correus, contrasenyes ni cap formulari de login.
export function observeAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error(error);
        callback(null, "No s'ha pogut iniciar l'aplicació. Revisa la connexió a Internet.");
      }
      return;
    }

    const member = getSelectedMember();

    // Firebase ja està autenticat, però el dispositiu encara no sap quin membre és.
    if (!member) {
      callback({ uid: firebaseUser.uid, needsMemberSelection: true });
      return;
    }

    callback({
      uid: firebaseUser.uid,
      ...member
    });
  });
}

export function getSelectedMember() {
  const memberId = localStorage.getItem(MEMBER_STORAGE_KEY);
  return FAMILY_MEMBERS.find((member) => member.id === memberId) || null;
}

export function selectMember(memberId) {
  const member = FAMILY_MEMBERS.find((item) => item.id === memberId);
  if (!member) return null;

  localStorage.setItem(MEMBER_STORAGE_KEY, member.id);
  return member;
}

export function clearSelectedMember() {
  localStorage.removeItem(MEMBER_STORAGE_KEY);
}
