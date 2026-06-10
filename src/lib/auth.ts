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
import { isMobileEnv } from "./auth-env";
import { UserProfile } from "./types";

// Crea el documento del usuario en Firestore si aún no existe (primer login social).
async function ensureUserDoc(uid: string, email: string, provider: string): Promise<void> {
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

export const auth = {
    login: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            await signInWithEmailAndPassword(firebaseAuth, email, password);
            return { success: true };
        } catch (error: any) {
            console.error("Login error FULL:", error);
            return { success: false, error: error.message || "Unknown login error" };
        }
    },

    register: async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            // Try to create user document, but don't fail registration if it fails (we can create it later)
            try {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: email,
                    createdAt: new Date().toISOString()
                });
            } catch (dbError) {
                console.error("Firestore creation error (ignoring for now):", dbError);
            }
            return { success: true };
        } catch (error: any) {
            console.error("Registration error FULL:", error);
            return { success: false, error: error.message || "Unknown registration error" };
        }
    },

    logout: async () => {
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('scene_me_current_user'); // Clear legacy/cache
        } catch (error) {
            console.error("Logout error:", error);
        }
    },

    // Login con Google. Popup en escritorio; redirección en móvil/PWA; si el popup
    // se bloquea, cae a redirección. En redirección, el resultado se recoge al
    // recargar con completeRedirectLogin().
    loginWithGoogle: async (): Promise<{ success: boolean; redirecting?: boolean; error?: string }> => {
        const provider = new GoogleAuthProvider();
        try {
            if (isMobileEnv()) {
                await signInWithRedirect(firebaseAuth, provider);
                return { success: true, redirecting: true };
            }
            const cred = await signInWithPopup(firebaseAuth, provider);
            await ensureUserDoc(cred.user.uid, cred.user.email || "", "google");
            return { success: true };
        } catch (error: any) {
            const code: string = error?.code || "";
            // Popup bloqueado o no soportado -> fallback a redirección
            if (code.includes("popup-blocked") || code.includes("popup-closed") || code.includes("cancelled-popup") || code.includes("operation-not-supported")) {
                try {
                    await signInWithRedirect(firebaseAuth, new GoogleAuthProvider());
                    return { success: true, redirecting: true };
                } catch (e: any) {
                    return { success: false, error: e?.message || "No se pudo iniciar con Google" };
                }
            }
            if (code.includes("account-exists-with-different-credential")) {
                return { success: false, error: "Ya existe una cuenta con ese email (creada con contraseña). Inicia sesión con tu email." };
            }
            console.error("loginWithGoogle error:", error);
            return { success: false, error: error?.message || "No se pudo iniciar con Google" };
        }
    },

    // Completa el login tras volver de una redirección (móvil/PWA). Llamar al montar.
    completeRedirectLogin: async (): Promise<boolean> => {
        try {
            const res = await getRedirectResult(firebaseAuth);
            if (res && res.user) {
                await ensureUserDoc(res.user.uid, res.user.email || "", "google");
                return true;
            }
            return false;
        } catch (e) {
            console.error("completeRedirectLogin error:", e);
            return false;
        }
    },

    // Note: This is now async in reality, but for compatibility we might need a hook or context.
    // For now, we'll keep a simple wrapper that might need refactoring in components.
    // Ideally, use a React Context for Auth.
    getCurrentUser: async (): Promise<UserAccount | null> => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    // Fetch profile from Firestore
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    const data = docSnap.exists() ? docSnap.data() : {};

                    resolve({
                        email: user.email || "",
                        uid: user.uid,
                        profile: data.profile as UserProfile | undefined
                    });
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    },

    updateProfile: async (profile: UserProfile): Promise<void> => {
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
