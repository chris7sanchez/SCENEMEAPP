'use client';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "./firebase";
import { UserProfile } from "./types";

// Crea el documento del usuario en Firestore si aún no existe (primer login social).
async function ensureUserDoc(uid: string, email: string, provider: string): Promise<void> {
    if (!db) return;
    try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, { email, createdAt: new Date().toISOString(), provider });
        }
    } catch (e) {
        console.error("ensureUserDoc error:", e);
    }
}

export interface UserAccount {
    email: string;
    uid: string;
    profile?: UserProfile;
}

const NOT_CONFIGURED = "Firebase no está configurado en este entorno (faltan las claves NEXT_PUBLIC_FIREBASE_*).";

// Errores de Firebase Auth en lenguaje humano (los códigos crudos en inglés
// confunden al actor que solo quiere entrar).
function humanAuthError(error: any, fallback: string): string {
    const code: string = error?.code || "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
        return "Email o contraseña incorrectos. Si te registraste con Google, usa «Continuar con Google».";
    if (code.includes("too-many-requests"))
        return "Demasiados intentos. Espera unos minutos o restablece tu contraseña.";
    if (code.includes("invalid-email")) return "Ese email no tiene un formato válido.";
    if (code.includes("email-already-in-use"))
        return "Ese email ya tiene cuenta. Inicia sesión (o usa «Continuar con Google» si la creaste así).";
    if (code.includes("weak-password")) return "La contraseña debe tener al menos 6 caracteres.";
    if (code.includes("network-request-failed")) return "Sin conexión con el servidor. Revisa tu internet e inténtalo de nuevo.";
    if (code.includes("user-disabled")) return "Esta cuenta está deshabilitada.";
    return error?.message || fallback;
}

export const auth = {
    login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
            return { success: true };
        } catch (error: any) {
            console.error("Login error FULL:", error);
            return { success: false, error: humanAuthError(error, "No se pudo iniciar sesión.") };
        }
    },

    register: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            // Try to create user document, but don't fail registration if it fails (we can create it later)
            try {
                if (db) await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: email,
                    createdAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Firestore creation error (ignoring for now):", dbError);
            }
            return { success: true };
        } catch (error: any) {
            console.error("Registration error FULL:", error);
            return { success: false, error: humanAuthError(error, "No se pudo crear la cuenta.") };
        }
    },

    logout: async () => {
        if (!firebaseAuth) { localStorage.removeItem('scene_me_current_user'); return; }
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('scene_me_current_user'); // Clear legacy/cache
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    // Login con Google. POPUP SIEMPRE primero, en todos los dispositivos:
    // signInWithRedirect está roto en Safari/iOS 16.1+ (partición de almacenamiento
    // de terceros: getRedirectResult vuelve null y el login falla EN SILENCIO)
    // mientras el authDomain sea *.firebaseapp.com. El popup se comunica por
    // postMessage y sí funciona. Redirección solo como último recurso.
    loginWithGoogle: async (): Promise<{ success: boolean; redirecting?: boolean; error?: string }> => {
        if (!firebaseAuth) return { success: false, error: NOT_CONFIGURED };
        const provider = new GoogleAuthProvider();
        try {
            const cred = await signInWithPopup(firebaseAuth, provider);
            await ensureUserDoc(cred.user.uid, cred.user.email || "", "google");
            return { success: true };
        } catch (error: any) {
            const code: string = error?.code || "";
            // El usuario cerró la ventana: no es un fallo técnico, avisar y ya
            if (code.includes("popup-closed") || code.includes("cancelled-popup")) {
                return { success: false, error: "Ventana de Google cerrada antes de terminar. Vuelve a intentarlo." };
            }
            // Popup bloqueado o entorno sin popups (PWA instalada) -> redirección
            if (code.includes("popup-blocked") || code.includes("operation-not-supported")) {
                try {
                    localStorage.setItem("auth_redirect_pending", String(Date.now()));
                    await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
                    return { success: true, redirecting: true };
                } catch (e: any) {
                    return { success: false, error: e?.message || "No se pudo iniciar con Google" };
                }
            }
            if (code.includes("account-exists-with-different-credential")) {
                return { success: false, error: "Ya existe una cuenta con ese email (creada con contraseña). Inicia sesión con tu email." };
            }
            if (code.includes("unauthorized-domain")) {
                return { success: false, error: "Este dominio no está autorizado en Firebase (Authentication → Dominios autorizados)." };
            }
            console.error("loginWithGoogle error:", error);
            return { success: false, error: error?.message || "No se pudo iniciar con Google" };
        }
    },

    // Completa el login tras volver de una redirección (fallback PWA). Llamar al montar.
    // Si veníamos de una redirección (flag) y no hay resultado ni sesión, es el
    // fallo silencioso de Safari/ITP: lo devolvemos como error visible.
    completeRedirectLogin: async (): Promise<{ ok: boolean; error?: string }> => {
        if (!firebaseAuth) return { ok: false };
        const pending = localStorage.getItem("auth_redirect_pending");
        try {
            const res = await getRedirectResult(firebaseAuth);
            localStorage.removeItem("auth_redirect_pending");
            if (res && res.user) {
                await ensureUserDoc(res.user.uid, res.user.email || "", "google");
                return { ok: true };
            }
            // Redirección iniciada hace <5 min pero sin resultado NI usuario: Safari la bloqueó
            if (pending && Date.now() - Number(pending) < 5 * 60 * 1000 && !firebaseAuth.currentUser) {
                return { ok: false, error: "Safari bloqueó el acceso por redirección. Vuelve a pulsar «Continuar con Google» (se abrirá una ventana)." };
            }
            return { ok: false };
        } catch (e: any) {
            localStorage.removeItem("auth_redirect_pending");
            console.error("completeRedirectLogin error:", e);
            return { ok: false, error: e?.message };
        }
    },

    // Note: This is now async in reality, but for compatibility we might need a hook or context.
    // For now, we'll keep a simple wrapper that might need refactoring in components.
    // Ideally, use a React Context for Auth.
    getCurrentUser: async (): Promise<UserAccount | null> => {
        return new Promise((resolve) => {
            if (!firebaseAuth) { resolve(null); return; } // Sin Firebase → invitado
            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    // Perfil desde Firestore (si hay db); si no, devolvemos al usuario sin perfil.
                    let profile: UserProfile | undefined;
                    if (db) {
                        try {
                            const docSnap = await getDoc(doc(db, "users", user.uid));
                            const data = docSnap.exists() ? docSnap.data() : {};
                            profile = data.profile as UserProfile | undefined;
                        } catch (e) {
                            console.error("getCurrentUser profile fetch error:", e);
                        }
                    }
                    resolve({ email: user.email || "", uid: user.uid, profile });
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    },

    updateProfile: async (profile: UserProfile): Promise<void> => {
        if (!firebaseAuth || !db) return;
        const user = firebaseAuth.currentUser;
        if (!user) return;

        try {
            // Use setDoc with merge: true instead of updateDoc
            // This ensures that if the document doesn't exist (e.g. registration failed halfway),
            // it will be created now.
            await setDoc(doc(db, "users", user.uid), {
                profile
            }, { merge: true });
            // Optional: Update local cache if needed for immediate UI updates without refetching
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }
};
