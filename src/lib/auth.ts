'use client';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "./firebase";
import { UserProfile } from "./types";

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
